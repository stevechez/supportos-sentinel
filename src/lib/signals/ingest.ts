import type { createClient } from '@supportos/auth/server';

import { normalizeSignalInput } from './normalize';
import type { OperationalSignal, RawSignalInput } from './types';

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export class SignalIngestError extends Error {
	constructor(message: string, cause?: unknown) {
		super(message);
		this.name = 'SignalIngestError';
		if (cause !== undefined) {
			this.cause = cause;
		}
	}
}

function toOperationalSignal(row: {
	id: string;
	type: string;
	source: string;
	source_ref: string | null;
	title: string;
	content: string | null;
	severity: string | null;
	created_at: string;
	finding_id: string | null;
}): OperationalSignal {
	return {
		id: row.id,
		type: row.type as OperationalSignal['type'],
		source: row.source,
		sourceRef: row.source_ref,
		title: row.title,
		content: row.content,
		severity: row.severity as OperationalSignal['severity'],
		createdAt: row.created_at,
		findingId: row.finding_id,
	};
}

/**
 * Normalizes and stores one raw signal for an organization. This is the
 * single entry point every ingestion path is meant to funnel through --
 * the manual-entry form today (src/lib/signals/actions.ts), a CSV import
 * or a real integration later. Throws SignalValidationError (from
 * normalize.ts) for bad input, SignalIngestError for a database failure --
 * callers are expected to catch both and degrade gracefully, same
 * discipline as the dashboard and AI boundaries.
 */
export async function ingestSignal(
	supabase: SupabaseClient,
	organizationId: string,
	raw: RawSignalInput,
): Promise<OperationalSignal> {
	const normalized = normalizeSignalInput(raw);

	const { data, error } = await supabase
		.from('sentinel_signals')
		.insert({
			organization_id: organizationId,
			type: normalized.type,
			source: normalized.source,
			source_ref: normalized.sourceRef,
			title: normalized.title,
			content: normalized.content,
			severity: normalized.severity,
		})
		.select('*')
		.single();

	if (error || !data) {
		throw new SignalIngestError('Could not save this signal. Please try again.', error);
	}

	return toOperationalSignal(data);
}

/**
 * Batch-ingests signals from a connector (Phase 9B), upserting on
 * (organization_id, source_ref) so re-running a sync never creates
 * duplicate signals for the same underlying event -- a signal already
 * seen is silently skipped rather than re-inserted or overwritten.
 * Returns only the rows that were newly inserted (PostgREST returns no
 * row for a conflict that was ignored), so callers can report "N new
 * signals" accurately.
 */
export async function ingestSignalBatch(
	supabase: SupabaseClient,
	organizationId: string,
	rawSignals: RawSignalInput[],
): Promise<OperationalSignal[]> {
	if (rawSignals.length === 0) {
		return [];
	}

	const rows = rawSignals.map(raw => {
		const normalized = normalizeSignalInput(raw);
		return {
			organization_id: organizationId,
			type: normalized.type,
			source: normalized.source,
			source_ref: normalized.sourceRef,
			title: normalized.title,
			content: normalized.content,
			severity: normalized.severity,
		};
	});

	const { data, error } = await supabase
		.from('sentinel_signals')
		.upsert(rows, { onConflict: 'organization_id,source_ref', ignoreDuplicates: true })
		.select('*');

	if (error) {
		throw new SignalIngestError('Could not save signals from this sync. Please try again.', error);
	}

	return (data ?? []).map(toOperationalSignal);
}
