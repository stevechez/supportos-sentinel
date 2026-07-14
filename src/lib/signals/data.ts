import { createClient } from '@supportos/auth/server';

import { getCurrentMembership } from '@/lib/dashboard/dashboard';

import { detectSignalPatterns, type SignalPattern } from './patterns';
import type { OperationalSignal } from './types';

export interface SignalsOverview {
	signals: OperationalSignal[];
	patterns: SignalPattern[];
}

function toOperationalSignal(row: {
	id: string;
	type: string;
	source: string;
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
