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

// A distinct, generic error type for anything that goes wrong talking to
// Supabase while building the dashboard -- a network blip, an RLS denial
// that shouldn't happen, a malformed query, etc. Deliberately does not
// carry the raw Supabase error message forward to the UI: the message
// shown to the user (via the (dashboard)/error.tsx boundary) is always the
// same generic, non-technical copy. The original error is still logged via
// `cause` for debugging.
export class DashboardDataError extends Error {
	constructor(context: string, cause: unknown) {
		super('Something went wrong loading Sentinel data. Please try again.');
		this.name = 'DashboardDataError';
		this.cause = cause;
		console.error(`[dashboard] ${context}:`, cause);
	}
}

function assertNoError(context: string, error: { message: string } | null): void {
	if (error) {
		throw new DashboardDataError(context, error);
	}
}

// ---------------------------------------------------------------------------
// Organization resolution
// ---------------------------------------------------------------------------

async function getCurrentOrganizationId(): Promise<string | null> {
	const supabase = await createClient();

	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	// Not signed in / session invalid -- not a Sentinel data error, the
	// route itself is auth-protected upstream. Treat as "no organization".
	if (userError || !user) {
		return null;
	}

	const { data: member, error: memberError } = await supabase
		.from('members')
		.select('organization_id')
		.eq('user_id', user.id)
		.limit(1)
		.maybeSingle();

	assertNoError('resolving current organization', memberError);

	return member?.organization_id ?? null;
}

// ---------------------------------------------------------------------------
// Raw fetchers -- thin wrappers over Supabase, no business logic. Every
// query is scoped to the current organization and relies on RLS as a second
// line of defense. A genuine Supabase failure throws DashboardDataError,
// which the (dashboard)/error.tsx boundary turns into a graceful message
// instead of a blank or broken page.
// ---------------------------------------------------------------------------

async function fetchFindings(organizationId: string, onlyOpen: boolean): Promise<FindingRow[]> {
	const supabase = await createClient();

	let query = supabase.from('sentinel_findings').select('*').eq('organization_id', organizationId);
	if (onlyOpen) {
		query = query.eq('status', 'open');
	}

	const { data, error } = await query.order('created_at', { ascending: false });
	assertNoError('fetching findings', error);
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

	const { data, error } = await query.order('created_at', { ascending: false });
	assertNoError('fetching recommendations', error);
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

	const { data, error } = await query.order('created_at', { ascending: false });
	assertNoError('fetching knowledge gaps', error);
	return data ?? [];
}

async function fetchReports(organizationId: string): Promise<ReportRow[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('sentinel_reports')
		.select('*')
		.eq('organization_id', organizationId)
		.order('created_at', { ascending: false });

	assertNoError('fetching reports', error);
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
