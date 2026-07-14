'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@supportos/auth/server';

import { getCurrentMembership } from '@/lib/dashboard/dashboard';
import { logActivity } from '@/lib/activity';

import { ingestSignal, SignalIngestError } from './ingest';
import { buildPattern, MIN_RECURRENCE, deriveFindingFromPattern } from './patterns';
import { syncSupportOsSignals, SignalSyncError } from './sync';
import { SignalValidationError, type OperationalSignal, type RawSignalInput } from './types';

export type AddSignalResult = { ok: true; signal: OperationalSignal } | { ok: false; error: string };
export type CreateFindingFromPatternResult = { ok: true; findingId: string } | { ok: false; error: string };
export type SyncSupportOsSignalsResult =
	| { ok: true; newSignalCount: number }
	| { ok: false; error: string };

/**
 * Server Action behind the "+ Add Signal" form (Phase 8C). Every signal,
 * regardless of future source, is meant to funnel through
 * ingestSignal()/normalizeSignalInput() -- this action is just the auth/org
 * boundary around that shared path.
 */
export async function addSignalAction(raw: RawSignalInput): Promise<AddSignalResult> {
	try {
		const membership = await getCurrentMembership();
		if (!membership) {
			return { ok: false, error: "We couldn't verify your organization. Please try again." };
		}

		const supabase = await createClient();
		const signal = await ingestSignal(supabase, membership.organizationId, raw);

		revalidatePath('/dashboard');
		return { ok: true, signal };
	} catch (error) {
		if (error instanceof SignalValidationError || error instanceof SignalIngestError) {
			return { ok: false, error: error.message };
		}
		console.error('[signals] unexpected error adding signal:', error);
		return { ok: false, error: 'Something went wrong saving this signal. Please try again.' };
	}
}

/**
 * Server Action behind "Create Finding" on a detected pattern (Phase 8D).
 * Deliberately takes only signal ids, not the pattern's derived numbers --
 * everything (recurrence, day span, severity, confidence) is recomputed
 * here from the actual rows, scoped to the caller's organization, so a
 * client can never fabricate a finding by sending made-up stats. Creating
 * the finding is an explicit human action, never automatic -- the
 * deterministic grouping only ever produces a *candidate*.
 */
export async function createFindingFromPatternAction(
	signalIds: string[],
): Promise<CreateFindingFromPatternResult> {
	try {
		const membership = await getCurrentMembership();
		if (!membership) {
			return { ok: false, error: "We couldn't verify your organization. Please try again." };
		}

		if (signalIds.length < MIN_RECURRENCE) {
			return { ok: false, error: 'Not enough signals to form a pattern.' };
		}

		const supabase = await createClient();

		const { data: rows, error: fetchError } = await supabase
			.from('sentinel_signals')
			.select('*')
			.eq('organization_id', membership.organizationId)
			.in('id', signalIds)
			.is('finding_id', null);

		if (fetchError || !rows || rows.length < MIN_RECURRENCE) {
			return { ok: false, error: 'This pattern is no longer available.' };
		}

		const signals = rows.map(row => ({
			id: row.id,
			type: row.type as OperationalSignal['type'],
			source: row.source,
			sourceRef: row.source_ref,
			title: row.title,
			content: row.content,
			severity: row.severity as OperationalSignal['severity'],
			createdAt: row.created_at,
			findingId: row.finding_id,
		}));

		const pattern = buildPattern('manual', signals);
		const derived = deriveFindingFromPattern(pattern);

		const { data: finding, error: insertError } = await supabase
			.from('sentinel_findings')
			.insert({
				organization_id: membership.organizationId,
				title: derived.title,
				category: derived.category,
				severity: derived.severity,
				description: derived.description,
				business_impact: derived.businessImpact,
				confidence_score: derived.confidenceScore,
				source: 'signal_pattern',
				status: 'open',
			})
			.select('id')
			.single();

		if (insertError || !finding) {
			console.error('[signals] creating finding from pattern:', insertError);
			return { ok: false, error: 'Could not create a finding from this pattern. Please try again.' };
		}

		const { error: linkError } = await supabase
			.from('sentinel_signals')
			.update({ finding_id: finding.id })
			.eq('organization_id', membership.organizationId)
			.in('id', signalIds);

		if (linkError) {
			console.error('[signals] linking signals to finding:', linkError);
			// The finding was created successfully -- linking is bookkeeping,
			// not worth failing the whole action over.
		}

		await logActivity(supabase, {
			organizationId: membership.organizationId,
			memberId: membership.memberId,
			action: 'created_finding_from_pattern',
			entityType: 'sentinel_finding',
			entityId: finding.id,
		});

		revalidatePath('/dashboard');
		return { ok: true, findingId: finding.id };
	} catch (error) {
		console.error('[signals] unexpected error creating finding from pattern:', error);
		return { ok: false, error: 'Something went wrong. Please try again.' };
	}
}

/**
 * Server Action behind "Sync Now" on the Connected Sources card
 * (Phase 9D). Pulls this org's SupportOS tickets and upserts the signals
 * they produce -- see src/lib/signals/sync.ts. A manual pull, not a
 * webhook or background job, per the phase's explicit "no real-time
 * streaming infrastructure" scope.
 */
export async function syncSupportOsSignalsAction(): Promise<SyncSupportOsSignalsResult> {
	try {
		const membership = await getCurrentMembership();
		if (!membership) {
			return { ok: false, error: "We couldn't verify your organization. Please try again." };
		}

		const supabase = await createClient();
		const { newSignals } = await syncSupportOsSignals(supabase, membership.organizationId);

		await logActivity(supabase, {
			organizationId: membership.organizationId,
			memberId: membership.memberId,
			action: 'synced_signals',
			metadata: { newSignalCount: newSignals.length },
		});

		revalidatePath('/dashboard');
		return { ok: true, newSignalCount: newSignals.length };
	} catch (error) {
		if (error instanceof SignalSyncError) {
			return { ok: false, error: error.message };
		}
		console.error('[signals] unexpected error syncing SupportOS signals:', error);
		return { ok: false, error: 'Something went wrong syncing with SupportOS. Please try again.' };
	}
}
