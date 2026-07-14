import { createClient } from '@supportos/auth/server';

import { getCurrentMembership } from '@/lib/dashboard/dashboard';

import { getConnections } from './connections';
import { detectSignalPatterns, type SignalPattern } from './patterns';
import { SIGNAL_SOURCE_LABELS, type SignalSource } from './sources';
import type { OperationalSignal } from './types';

export interface SignalsOverview {
	signals: OperationalSignal[];
	patterns: SignalPattern[];
}

/**
 * One row in the Phase 10B "Connected Sources" card. Broader than a raw
 * sentinel_connections row -- covers manual entry (always available, no
 * connection row needed) and "coming soon" providers (no row, no action)
 * alongside real connections.
 */
export type ConnectedSourceState = 'connected' | 'available' | 'coming_soon';

export interface ConnectedSourceStatus {
	/** Unique per row -- may differ from `source` when a provider gets more than one row (Phase 11G: "SupportOS Tickets" and "Chat Conversations" are both provider 'supportos'). */
	key: string;
	source: SignalSource;
	label: string;
	state: ConnectedSourceState;
	signalCount: number;
	/** Null if this source has never produced a signal for this org yet. */
	lastSyncedAt: string | null;
	/** Whether this row owns the Connect/Sync action, or is purely informational (rides on another row's connection). */
	actionable: boolean;
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
 * Fetches the current organization's signals and runs deterministic
 * pattern detection over them. Returns null when there's no resolvable
 * organization (same "not an error" treatment as the dashboard's
 * getExecutiveDashboardData for a signed-out or org-less session).
 */
export async function getSignalsOverview(): Promise<SignalsOverview | null> {
	const membership = await getCurrentMembership();
	if (!membership) {
		return null;
	}

	const supabase = await createClient();

	const { data, error } = await supabase
		.from('sentinel_signals')
		.select('*')
		.eq('organization_id', membership.organizationId)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('[signals] fetching signals:', error);
		return { signals: [], patterns: [] };
	}

	const signals = (data ?? []).map(toOperationalSignal);
	const patterns = detectSignalPatterns(signals);

	return { signals, patterns };
}

/**
 * Phase 9D / 10B / 11G: "Sentinel is watching" -- one row per source the
 * Connected Sources card shows. Manual entry is always "available" (it's
 * just a form, no connection needed). SupportOS reflects a real
 * sentinel_connections row (Phase 10A) -- "connected" once the org has
 * clicked Connect/Sync at least once, otherwise it's the thing the
 * onboarding flow prompts for. "Chat Conversations" (Phase 11G) rides on
 * the same connection -- it's not a second integration, just a
 * type-filtered view of what that one sync already produced, so it has no
 * Connect/Sync button of its own. CSV is shown as "coming soon" per the
 * handoff -- no row, no action, just visibility into what's next.
 */
export async function getConnectedSourcesOverview(): Promise<ConnectedSourceStatus[] | null> {
	const membership = await getCurrentMembership();
	if (!membership) {
		return null;
	}

	const supabase = await createClient();

	const [{ data: signalRows, error: signalError }, connections] = await Promise.all([
		supabase
			.from('sentinel_signals')
			.select('source, type, created_at')
			.eq('organization_id', membership.organizationId),
		getConnections(supabase, membership.organizationId),
	]);

	if (signalError) {
		console.error('[signals] fetching connected sources:', signalError);
	}

	const bySource = new Map<string, { count: number; lastSyncedAt: string | null }>();
	let conversationCount = 0;
	for (const row of signalRows ?? []) {
		const existing = bySource.get(row.source) ?? { count: 0, lastSyncedAt: null };
		existing.count += 1;
		if (!existing.lastSyncedAt || row.created_at > existing.lastSyncedAt) {
			existing.lastSyncedAt = row.created_at;
		}
		bySource.set(row.source, existing);

		if (row.source === 'supportos' && row.type === 'conversation') {
			conversationCount += 1;
		}
	}

	const manualStats = bySource.get('manual');
	const supportOsConnection = connections.get('supportos');
	const supportOsStats = bySource.get('supportos');
	const supportOsState: ConnectedSourceState =
		supportOsConnection?.status === 'connected' ? 'connected' : 'available';
	const supportOsLastSync = supportOsConnection?.lastSyncAt ?? supportOsStats?.lastSyncedAt ?? null;

	return [
		{
			key: 'supportos-tickets',
			source: 'supportos',
			label: 'SupportOS Tickets',
			state: supportOsState,
			signalCount: supportOsStats?.count ?? 0,
			lastSyncedAt: supportOsLastSync,
			actionable: true,
		},
		{
			key: 'chat-conversations',
			source: 'supportos',
			label: 'Chat Conversations',
			state: supportOsState,
			signalCount: conversationCount,
			lastSyncedAt: supportOsLastSync,
			actionable: false,
		},
		{
			key: 'manual',
			source: 'manual',
			label: SIGNAL_SOURCE_LABELS.manual,
			state: 'available',
			signalCount: manualStats?.count ?? 0,
			lastSyncedAt: manualStats?.lastSyncedAt ?? null,
			actionable: false,
		},
		{
			key: 'csv',
			source: 'csv',
			label: SIGNAL_SOURCE_LABELS.csv,
			state: 'coming_soon',
			signalCount: 0,
			lastSyncedAt: null,
			actionable: false,
		},
	];
}
