import { createClient } from '@supportos/auth/server';
import type { Tables } from '@supportos/database/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Finding {
	id: string;
	title: string;
	severity: 'Critical' | 'High' | 'Medium';
	confidence: number;
	detected: string;
}

export interface Recommendation {
	id: string;
	title: string;
	impact: string;
	priority: 'High' | 'Medium' | 'Low';
}

export interface HealthScore {
	score: number;
	previousScore: number;
}

export interface ExecutiveSummary {
	summary: string;
	keyTakeaway: string;
}

export interface DashboardCounts {
	criticalFindings: number;
	knowledgeGaps: number;
	recommendedActions: number;
	healthReports: number;
}

export interface ExecutiveDashboardData {
	healthScore: HealthScore;
	executiveSummary: ExecutiveSummary;
	criticalFindings: Finding[];
	recommendations: Recommendation[];
	counts: DashboardCounts;
}

type FindingRow = Tables<'sentinel_findings'>;
type RecommendationRow = Tables<'sentinel_recommendations'>;

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
// Raw fetchers
// ---------------------------------------------------------------------------

async function fetchOpenFindings(organizationId: string): Promise<FindingRow[]> {
	const supabase = await createClient();

	const { data } = await supabase
		.from('sentinel_findings')
		.select('*')
		.eq('organization_id', organizationId)
		.eq('status', 'open')
		.order('created_at', { ascending: false });

	return data ?? [];
}

async function fetchPendingRecommendations(
	organizationId: string,
): Promise<RecommendationRow[]> {
	const supabase = await createClient();

	const { data } = await supabase
		.from('sentinel_recommendations')
		.select('*')
		.eq('organization_id', organizationId)
		.eq('status', 'pending')
		.order('created_at', { ascending: false });

	return data ?? [];
}

async function fetchOpenKnowledgeGapCount(organizationId: string): Promise<number> {
	const supabase = await createClient();

	const { count } = await supabase
		.from('sentinel_knowledge_gaps')
		.select('id', { count: 'exact', head: true })
		.eq('organization_id', organizationId)
		.eq('status', 'open');

	return count ?? 0;
}

async function fetchLatestReport(
	organizationId: string,
): Promise<Tables<'sentinel_reports'> | null> {
	const supabase = await createClient();

	const { data } = await supabase
		.from('sentinel_reports')
		.select('*')
		.eq('organization_id', organizationId)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();

	return data;
}

async function fetchReportCount(organizationId: string): Promise<number> {
	const supabase = await createClient();

	const { count } = await supabase
		.from('sentinel_reports')
		.select('id', { count: 'exact', head: true })
		.eq('organization_id', organizationId);

	return count ?? 0;
}

// ---------------------------------------------------------------------------
// Mapping helpers (DB row -> UI shape)
// ---------------------------------------------------------------------------

function toSeverityLabel(severity: string): Finding['severity'] {
	switch (severity) {
		case 'critical':
			return 'Critical';
		case 'high':
			return 'High';
		default:
			return 'Medium';
	}
}

function toPriorityLabel(priority: string | null): Recommendation['priority'] {
	switch (priority) {
		case 'high':
			return 'High';
		case 'low':
			return 'Low';
		default:
			return 'Medium';
	}
}

function toRelativeTime(isoDate: string | null): string {
	if (!isoDate) {
		return 'Unknown';
	}

	const then = new Date(isoDate).getTime();
	const diffMs = Date.now() - then;
	const diffMinutes = Math.round(diffMs / 60_000);

	if (diffMinutes < 1) {
		return 'Just now';
	}
	if (diffMinutes < 60) {
		return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
	}

	const diffHours = Math.round(diffMinutes / 60);
	if (diffHours < 24) {
		return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
	}

	const diffDays = Math.round(diffHours / 24);
	if (diffDays === 1) {
		return 'Yesterday';
	}
	if (diffDays < 7) {
		return `${diffDays} days ago`;
	}

	return new Date(isoDate).toLocaleDateString();
}

function toFinding(row: FindingRow): Finding {
	return {
		id: row.id,
		title: row.title,
		severity: toSeverityLabel(row.severity),
		confidence: Math.round(row.confidence_score ?? 0),
		detected: toRelativeTime(row.created_at),
	};
}

function toRecommendation(row: RecommendationRow): Recommendation {
	return {
		id: row.id,
		title: row.recommendation,
		impact: row.expected_impact ?? 'Impact not yet assessed.',
		priority: toPriorityLabel(row.priority),
	};
}

// ---------------------------------------------------------------------------
// Deterministic health score
//
// Starts at 100 and deducts a fixed, explainable number of points per
// open issue. Weights are intentionally simple and documented here so the
// score is auditable -- there is no hidden "AI" weighting.
// ---------------------------------------------------------------------------

const HEALTH_SCORE_WEIGHTS = {
	criticalFinding: 15,
	highFinding: 8,
	mediumFinding: 3,
	pendingRecommendation: 2,
	openKnowledgeGap: 1,
} as const;

export function calculateHealthScore(
	findings: FindingRow[],
	recommendations: RecommendationRow[],
	knowledgeGapCount: number,
): number {
	let score = 100;

	for (const finding of findings) {
		if (finding.severity === 'critical') {
			score -= HEALTH_SCORE_WEIGHTS.criticalFinding;
		} else if (finding.severity === 'high') {
			score -= HEALTH_SCORE_WEIGHTS.highFinding;
		} else {
			score -= HEALTH_SCORE_WEIGHTS.mediumFinding;
		}
	}

	score -= recommendations.length * HEALTH_SCORE_WEIGHTS.pendingRecommendation;
	score -= knowledgeGapCount * HEALTH_SCORE_WEIGHTS.openKnowledgeGap;

	return Math.max(0, Math.min(100, Math.round(score)));
}

// ---------------------------------------------------------------------------
// Deterministic executive summary
//
// Composed from the highest-severity open finding and the highest-priority
// pending recommendation. No LLM call -- plain string templating over real
// rows so the output is always traceable back to specific findings.
// ---------------------------------------------------------------------------

const SEVERITY_RANK: Record<string, number> = { critical: 3, high: 2, medium: 1 };
const PRIORITY_RANK: Record<string, number> = { high: 3, medium: 2, low: 1 };

function topFinding(findings: FindingRow[]): FindingRow | null {
	if (findings.length === 0) {
		return null;
	}
	return [...findings].sort((a, b) => {
		const rankDiff = (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0);
		if (rankDiff !== 0) {
			return rankDiff;
		}
		return (b.confidence_score ?? 0) - (a.confidence_score ?? 0);
	})[0];
}

function topRecommendation(recommendations: RecommendationRow[]): RecommendationRow | null {
	if (recommendations.length === 0) {
		return null;
	}
	return [...recommendations].sort(
		(a, b) => (PRIORITY_RANK[b.priority ?? ''] ?? 0) - (PRIORITY_RANK[a.priority ?? ''] ?? 0),
	)[0];
}

export function generateExecutiveSummary(
	findings: FindingRow[],
	recommendations: RecommendationRow[],
): ExecutiveSummary {
	const criticalCount = findings.filter(f => f.severity === 'critical').length;
	const highCount = findings.filter(f => f.severity === 'high').length;
	const leadFinding = topFinding(findings);
	const leadRecommendation = topRecommendation(recommendations);

	if (!leadFinding) {
		return {
			summary:
				'Customer operations are healthy. Sentinel has not detected any open findings requiring attention right now.',
			keyTakeaway:
				'No action needed -- Sentinel will surface new findings here as soon as they are detected.',
		};
	}

	const issueCountPhrase =
		criticalCount > 0
			? `${criticalCount} critical and ${highCount} high-priority issue${highCount === 1 ? '' : 's'}`
			: `${highCount} high-priority issue${highCount === 1 ? '' : 's'}`;

	const summary = `Customer operations currently show ${issueCountPhrase}. The most urgent is "${leadFinding.title}"${leadFinding.business_impact ? ` -- ${leadFinding.business_impact}` : ''}. ${
		leadRecommendation
			? `Addressing "${leadRecommendation.recommendation}" is the top recommended next step.`
			: 'Sentinel has not yet generated a recommendation for it.'
	}`;

	const keyTakeaway = leadRecommendation
		? `Prioritize "${leadRecommendation.recommendation}" first. ${leadRecommendation.expected_impact ?? 'Expected impact has not been assessed yet.'}`
		: `Investigate "${leadFinding.title}" -- it is currently the highest-severity open finding.`;

	return { summary, keyTakeaway };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getExecutiveDashboardData(): Promise<ExecutiveDashboardData | null> {
	const organizationId = await getCurrentOrganizationId();

	if (!organizationId) {
		return null;
	}

	const [findings, recommendations, knowledgeGapCount, reportCount, latestReport] =
		await Promise.all([
			fetchOpenFindings(organizationId),
			fetchPendingRecommendations(organizationId),
			fetchOpenKnowledgeGapCount(organizationId),
			fetchReportCount(organizationId),
			fetchLatestReport(organizationId),
		]);

	const score = calculateHealthScore(findings, recommendations, knowledgeGapCount);
	const previousScore = latestReport?.health_score ?? score;

	return {
		healthScore: { score, previousScore: Math.round(previousScore) },
		executiveSummary: generateExecutiveSummary(findings, recommendations),
		criticalFindings: findings.slice(0, 5).map(toFinding),
		recommendations: recommendations.slice(0, 5).map(toRecommendation),
		counts: {
			criticalFindings: findings.length,
			knowledgeGaps: knowledgeGapCount,
			recommendedActions: recommendations.length,
			healthReports: reportCount,
		},
	};
}
