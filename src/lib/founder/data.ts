import { createAdminClient } from '@supportos/auth/admin';

export interface FounderPilotRow {
	organizationId: string;
	organizationName: string;
	signupDate: string;
	memberCount: number;
	connectedSource: boolean;
	baselineCreated: boolean;
	lastActivityAt: string | null;
	feedbackCount: number;
	openFeedbackCount: number;
}

/**
 * Phase 19C -- the founder dashboard's one query. Deliberately read-only
 * (no mutation path exists here at all) and deliberately narrow: exactly
 * the six things the handoff asks for, one row per organization, nothing
 * that would let a founder edit another organization's data from this
 * page. Uses the service-role admin client because this is the one
 * legitimate cross-organization read in the whole app -- gated by
 * isFounder() at the call site (src/app/(dashboard)/dashboard/founder/page.tsx),
 * never reachable from a normal authenticated session.
 */
export async function getFounderPilotOverview(): Promise<FounderPilotRow[]> {
	const supabase = createAdminClient();

	const [{ data: organizations }, { data: members }, { data: connections }, { data: reports }, { data: activity }, { data: feedback }] =
		await Promise.all([
			supabase.from('organizations').select('id, name, created_at').order('created_at', { ascending: false }),
			supabase.from('members').select('organization_id'),
			supabase.from('sentinel_connections').select('organization_id, status'),
			supabase.from('sentinel_reports').select('organization_id'),
			supabase.from('activity_log').select('organization_id, created_at').order('created_at', { ascending: false }),
			supabase.from('customer_feedback').select('organization_id, status'),
		]);

	const memberCounts = countBy(members ?? [], row => row.organization_id);
	const hasConnection = new Set(
		(connections ?? []).filter(row => row.status === 'connected').map(row => row.organization_id),
	);
	const reportCounts = countBy(reports ?? [], row => row.organization_id);
	const lastActivity = new Map<string, string>();
	for (const row of activity ?? []) {
		// Rows are already ordered newest-first, so the first one seen per
		// organization is the most recent -- no extra sort needed.
		if (!lastActivity.has(row.organization_id)) {
			lastActivity.set(row.organization_id, row.created_at);
		}
	}
	const feedbackCounts = countBy(feedback ?? [], row => row.organization_id);
	const openFeedbackCounts = countBy(
		(feedback ?? []).filter(row => row.status === 'new'),
		row => row.organization_id,
	);

	return (organizations ?? []).map(org => ({
		organizationId: org.id,
		organizationName: org.name,
		signupDate: org.created_at,
		memberCount: memberCounts.get(org.id) ?? 0,
		connectedSource: hasConnection.has(org.id),
		baselineCreated: (reportCounts.get(org.id) ?? 0) > 0,
		lastActivityAt: lastActivity.get(org.id) ?? null,
		feedbackCount: feedbackCounts.get(org.id) ?? 0,
		openFeedbackCount: openFeedbackCounts.get(org.id) ?? 0,
	}));
}

function countBy<T>(rows: T[], key: (row: T) => string): Map<string, number> {
	const counts = new Map<string, number>();
	for (const row of rows) {
		const k = key(row);
		counts.set(k, (counts.get(k) ?? 0) + 1);
	}
	return counts;
}
