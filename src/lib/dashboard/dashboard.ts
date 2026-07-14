import { createClient } from '@supportos/auth/server';

import {
	buildDashboardMetrics,
	type DashboardMetrics,
	type FindingRow,
	type KnowledgeGapRow,
	type RecommendationRow,
	type ReportRow,
} from './analysis';

// Re-export the UI-facing types so components can import everything they
// need from one place (`@/lib/dashboard/dashboard`) without reaching into
// the analysis engine directly.
export type {
	DashboardCounts,
	EffortLevel,
	ExecutiveSummary,
	Finding,
	HealthScore,
	HealthScoreCategory,
	ImpactLevel,
	KnowledgeGap,
	Recommendation,
	SeverityLabel,
	Trend,
	TrendPoint,
} from './analysis';

export type ExecutiveDashboardData = DashboardMetrics;

// ---------------------------------------------------------------------------
// Organization resolution
// ---------------------------------------------------------------------------

async function getCurrentOrganizationId(): Promise<string | null> {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return null;
	}

	const { data: member } = await supabase
		.from('members')
		.select('organization_id')
		.eq('user_id', user.id)
		.limit(1)
		.maybeSingle();

	return member?.organization_id ?? null;
}

// ---------------------------------------------------------------------------
// Raw fetchers -- thin wrappers over Supabase, no business logic. Every
// query is scoped to the current organization and relies on RLS as a second
// line of defense.
// ---------------------------------------------------------------------------

async function fetchFindings(organizationId: string, onlyOpen: boolean): Promise<FindingRow[]> {
	const supabase = await createClient();

	let query = supabase.from('sentinel_findings').select('*').eq('organization_id', organizationId);
	if (onlyOpen) {
		query = query.eq('status', 'open');
	}

	const { data } = await query.order('created_at', { ascending: false });
	return data ?? [];
}

async function fetchRecommendations(
	organizationId: string,
	onlyPending: boolean,
): Promise<RecommendationRow[]> {
	const supabase = await createClient();

	let query = supabase
		.from('sentinel_recommendations')
		.select('*')
		.eq('organization_id', organizationId);
	if (onlyPending) {
		query = query.eq('status', 'pending');
	}

	const { data } = await query.order('created_at', { ascending: false });
	return data ?? [];
}

async function fetchKnowledgeGaps(
	organizationId: string,
	onlyOpen: boolean,
): Promise<KnowledgeGapRow[]> {
	const supabase = await createClient();

	let query = supabase
		.from('sentinel_knowledge_gaps')
		.select('*')
		.eq('organization_id', organizationId);
	if (onlyOpen) {
		query = query.eq('status', 'open');
	}

	const { data } = await query.order('created_at', { ascending: false });
	return data ?? [];
}

async function fetchReports(organizationId: string): Promise<ReportRow[]> {
	const supabase = await createClient();

	const { data } = await supabase
		.from('sentinel_reports')
		.select('*')
		.eq('organization_id', organizationId)
		.order('created_at', { ascending: false });

	return data ?? [];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getExecutiveDashboardData(): Promise<ExecutiveDashboardData | null> {
	const organizationId = await getCurrentOrganizationId();

	if (!organizationId) {
		return null;
	}

	const [openFindings, allFindings, pendingRecommendations, openKnowledgeGaps, allKnowledgeGaps, reports] =
		await Promise.all([
			fetchFindings(organizationId, true),
			fetchFindings(organizationId, false),
			fetchRecommendations(organizationId, true),
			fetchKnowledgeGaps(organizationId, true),
			fetchKnowledgeGaps(organizationId, false),
			fetchReports(organizationId),
		]);

	return buildDashboardMetrics({
		openFindings,
		allFindings,
		pendingRecommendations,
		openKnowledgeGaps,
		allKnowledgeGaps,
		reports,
		reportCount: reports.length,
	});
}
