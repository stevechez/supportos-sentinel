import { createClient } from '@supportos/auth/server';

import { getCurrentMembership } from '@/lib/dashboard/dashboard';

import { detectSignalPatterns, type SignalPattern } from './patterns';
import { CONNECTED_SIGNAL_SOURCES, SIGNAL_SOURCE_LABELS, type SignalSource } from './sources';
import type { OperationalSignal } from './types';

export interface SignalsOverview {
	signals: OperationalSignal[];
	patterns: SignalPattern[];
}

/** One row in the Phase 9D "Connected Sources" card. */
export interface ConnectedSourceStatus {
	source: SignalSource;
	label: string;
	signalCount: number;
	/** Null if this source has never produced a signal for this org yet. */
	lastSyncedAt: string | null;
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
 * Phase 9D: "Sentinel is watching" -- a per-source summary (signal count +
 * last time this source produced a signal) for the sources that actually
 * have a wired-up ingestion path today (manual entry, the SupportOS
 * connector). Built from the same sentinel_signals rows everything else
 * reads, grouped in application code rather than a new view -- there's
 * only a handful of sources, no need for a database aggregate.
 */
export async function getConnectedSourcesOverview(): Promise<ConnectedSourceStatus[] | null> {
	const membership = await getCurrentMembership();
	if (!membership) {
		return null;
	}

	const supabase = await createClient();

	const { data, error } = await supabase
		.from('sentinel_signals')
		.select('source, created_at')
		.eq('organization_id', membership.organizationId);

	if (error) {
		console.error('[signals] fetching connected sources:', error);
	}

	const rows = data ?? [];
	const bySource = new Map<string, { count: number; lastSyncedAt: string | null }>();

	for (const row of rows) {
		const existing = bySource.get(row.source) ?? { count: 0, lastSyncedAt: null };
		existing.count += 1;
		if (!existing.lastSyncedAt || row.created_at > existing.lastSyncedAt) {
			existing.lastSyncedAt = row.created_at;
		}
		bySource.set(row.source, existing);
	}

	return CONNECTED_SIGNAL_SOURCES.map(source => {
		const stats = bySource.get(source);
		return {
			source,
			label: SIGNAL_SOURCE_LABELS[source],
			signalCount: stats?.count ?? 0,
			lastSyncedAt: stats?.lastSyncedAt ?? null,
		};
	});
}
