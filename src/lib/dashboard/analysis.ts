import type { Tables } from '@supportos/database/types';

// ---------------------------------------------------------------------------
// Sentinel's deterministic analysis engine.
//
// Everything in this file is pure and rule-based -- no network calls, no
// LLMs, no randomness. Given the same rows, it always produces the same
// output, and every number here can be traced back to a documented rule.
// This is intentionally product-specific to Sentinel's dashboard; it is not
// a candidate for @supportos/core.
// ---------------------------------------------------------------------------

export type FindingRow = Tables<'sentinel_findings'>;
export type RecommendationRow = Tables<'sentinel_recommendations'>;
export type KnowledgeGapRow = Tables<'sentinel_knowledge_gaps'>;
export type ReportRow = Tables<'sentinel_reports'>;

// ---------------------------------------------------------------------------
// UI-facing types
// ---------------------------------------------------------------------------

export type SeverityLabel = 'Critical' | 'High' | 'Medium';
export type ImpactLevel = 'High' | 'Medium' | 'Low';
export type EffortLevel = 'Low' | 'Medium' | 'High';

export interface Finding {
	id: string;
	title: string;
	severity: SeverityLabel;
	confidence: number;
	detected: string;
	category: string;
	businessImpact: string | null;
	rank: number;
	isTopPriority: boolean;
	reasons: string[];
}

export interface Recommendation {
	id: string;
	title: string;
	impactDescription: string;
	impact: ImpactLevel;
	effort: EffortLevel;
	rank: number;
}

export interface KnowledgeGap {
	id: string;
	question: string;
	occurrenceCount: number;
	confidence: number;
	recommendedDocument: string | null;
	hasDocumentationPlan: boolean;
}

export interface HealthScoreCategory {
	key: 'documentation' | 'ticketQuality' | 'knowledgeCoverage' | 'operationalRisk';
	label: string;
	score: number;
	description: string;
}

export interface HealthScore {
	score: number;
	previousScore: number;
	categories: HealthScoreCategory[];
}

export interface TrendPoint {
	current: number;
	previous: number;
	delta: number;
}

export interface Trend {
	available: boolean;
	message?: string;
	healthScore?: TrendPoint;
	criticalFindings?: TrendPoint;
	knowledgeGaps?: TrendPoint;
}

export interface ExecutiveSummary {
	summary: string;
	keyTakeaway: string;
	topRisks: string[];
	potentialScoreGain: number;
}

// ---------------------------------------------------------------------------
// Small shared helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min = 0, max = 100): number {
	return Math.max(min, Math.min(max, value));
}

function daysSince(isoDate: string | null): number {
	if (!isoDate) {
		return 0;
	}
	const diffMs = Date.now() - new Date(isoDate).getTime();
	return Math.max(0, Math.floor(diffMs / 86_400_000));
}

function toSeverityLabel(severity: string): SeverityLabel {
	switch (severity) {
		case 'critical':
			return 'Critical';
		case 'high':
			return 'High';
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

// ---------------------------------------------------------------------------
// Health Score v2
//
// Four named, independently-explainable categories, each starting at 100
// and deducting fixed, documented point values. The overall score is a
// weighted average of the categories -- not an opaque single number.
// ---------------------------------------------------------------------------

const CATEGORY_WEIGHTS = {
	documentation: 0.2,
	ticketQuality: 0.3,
	knowledgeCoverage: 0.2,
	operationalRisk: 0.3,
} as const;

const FINDING_SEVERITY_DEDUCTIONS: Record<string, number> = {
	critical: 18,
	high: 10,
	medium: 4,
};

const TICKET_QUALITY_DEDUCTIONS: Record<string, number> = {
	critical: 20,
	high: 12,
	medium: 6,
};

function scoreDocumentation(gaps: KnowledgeGapRow[]): number {
	const openGaps = gaps.filter(gap => gap.status === 'open');
	if (openGaps.length === 0) {
		return 100;
	}

	let score = 100;
	for (const gap of openGaps) {
		const occurrence = gap.occurrence_count ?? 1;
		// The more often customers ask a question with no documentation, the
		// more this category is docked -- occurrence_count is a direct proxy
		// for how many people are hitting the same undocumented gap.
		score -= occurrence >= 30 ? 12 : occurrence >= 10 ? 7 : 3;
	}
	return clamp(score);
}

function scoreKnowledgeCoverage(gaps: KnowledgeGapRow[]): number {
	const openGaps = gaps.filter(gap => gap.status === 'open');
	if (openGaps.length === 0) {
		return 100;
	}
	const withPlan = openGaps.filter(gap => Boolean(gap.recommended_document)).length;
	return clamp(Math.round((withPlan / openGaps.length) * 100));
}

function scoreTicketQuality(findings: FindingRow[]): number {
	const relevant = findings.filter(
		f => f.status === 'open' && (f.category === 'technical' || f.category === 'customer_sentiment'),
	);

	let score = 100;
	for (const finding of relevant) {
		score -= TICKET_QUALITY_DEDUCTIONS[finding.severity] ?? 6;
	}
	return clamp(score);
}

function scoreOperationalRisk(findings: FindingRow[], recommendations: RecommendationRow[]): number {
	let score = 100;

	for (const finding of findings.filter(f => f.status === 'open')) {
		score -= FINDING_SEVERITY_DEDUCTIONS[finding.severity] ?? 4;
	}

	const highPriorityPending = recommendations.filter(
		r => r.status === 'pending' && r.priority === 'high',
	).length;
	score -= highPriorityPending * 5;

	return clamp(score);
}

export function calculateHealthScore(
	findings: FindingRow[],
	recommendations: RecommendationRow[],
	gaps: KnowledgeGapRow[],
): { score: number; categories: HealthScoreCategory[] } {
	const categories: HealthScoreCategory[] = [
		{
			key: 'documentation',
			label: 'Documentation',
			score: scoreDocumentation(gaps),
			description: 'How well documentation keeps up with the questions customers actually ask.',
		},
		{
			key: 'ticketQuality',
			label: 'Ticket Quality',
			score: scoreTicketQuality(findings),
			description: 'Technical and sentiment findings currently driving support tickets.',
		},
		{
			key: 'knowledgeCoverage',
			label: 'Knowledge Coverage',
			score: scoreKnowledgeCoverage(gaps),
			description: 'Share of open knowledge gaps that already have a documentation fix identified.',
		},
		{
			key: 'operationalRisk',
			label: 'Operational Risk',
			score: scoreOperationalRisk(findings, recommendations),
			description: 'Open critical/high findings plus unaddressed high-priority recommendations.',
		},
	];

	const weightedSum = categories.reduce((sum, category) => {
		const weight = CATEGORY_WEIGHTS[category.key];
		return sum + category.score * weight;
	}, 0);

	return { score: clamp(Math.round(weightedSum)), categories };
}

// ---------------------------------------------------------------------------
// Finding prioritization
//
// A weighted score combining severity, how long the finding has been open,
// and whether it's part of a recurring pattern (multiple open findings in
// the same category, or a finding that has already survived a prior report
// cycle). Deterministic and re-computable from the same rows every time.
// ---------------------------------------------------------------------------

const FINDING_SEVERITY_WEIGHT: Record<string, number> = {
	critical: 100,
	high: 70,
	medium: 40,
};

export function prioritizeFindings(findings: FindingRow[], reports: ReportRow[] = []): Finding[] {
	const categoryCounts = new Map<string, number>();
	for (const finding of findings) {
		categoryCounts.set(finding.category, (categoryCounts.get(finding.category) ?? 0) + 1);
	}

	const oldestReportPeriodEnd = reports.reduce<string | null>((oldest, report) => {
		if (!report.report_period_end) {
			return oldest;
		}
		if (!oldest || new Date(report.report_period_end) < new Date(oldest)) {
			return report.report_period_end;
		}
		return oldest;
	}, null);

	const scored = findings.map(finding => {
		const ageDays = daysSince(finding.created_at);
		const severityScore = FINDING_SEVERITY_WEIGHT[finding.severity] ?? 40;
		const ageScore = Math.min(ageDays * 3, 45);
		const recurrenceCount = categoryCounts.get(finding.category) ?? 1;
		const recurrenceScore = recurrenceCount > 1 ? Math.min((recurrenceCount - 1) * 15, 30) : 0;

		const priorityScore = severityScore * 0.55 + ageScore * 0.25 + recurrenceScore * 0.2;

		const survivedAReport = Boolean(
			oldestReportPeriodEnd &&
				finding.created_at &&
				new Date(finding.created_at) <= new Date(oldestReportPeriodEnd),
		);

		const reasons: string[] = [`${toSeverityLabel(finding.severity)} severity`];
		if (ageDays >= 1) {
			reasons.push(`Open ${ageDays} day${ageDays === 1 ? '' : 's'}`);
		}
		if (survivedAReport) {
			reasons.push('Affected multiple reports');
		}
		if (recurrenceCount > 1) {
			reasons.push('Recurring issue pattern');
		}

		return { finding, priorityScore, reasons };
	});

	scored.sort((a, b) => b.priorityScore - a.priorityScore);

	return scored.map(({ finding, reasons }, index) => ({
		id: finding.id,
		title: finding.title,
		severity: toSeverityLabel(finding.severity),
		confidence: Math.round(finding.confidence_score ?? 0),
		detected: toRelativeTime(finding.created_at),
		category: finding.category,
		businessImpact: finding.business_impact,
		rank: index + 1,
		isTopPriority: index === 0,
		reasons,
	}));
}

// ---------------------------------------------------------------------------
// Recommendation prioritization
//
// Impact is derived from the linked finding's severity (a recommendation
// tied to a critical finding is high impact almost by definition), falling
// back to the recommendation's own `priority` column. Effort has no column
// in the schema, so it is estimated deterministically from the linked
// finding's category: documentation fixes (knowledge_gap) are Low effort,
// technical/customer_sentiment fixes default to Medium. This is a
// documented heuristic, not stored data -- it's called out here so it's
// never mistaken for a measured value.
// ---------------------------------------------------------------------------

const IMPACT_WEIGHT: Record<ImpactLevel, number> = { High: 3, Medium: 2, Low: 1 };
const EFFORT_WEIGHT: Record<EffortLevel, number> = { Low: 3, Medium: 2, High: 1 };

const CATEGORY_EFFORT: Record<string, EffortLevel> = {
	knowledge_gap: 'Low',
	customer_sentiment: 'Medium',
	technical: 'Medium',
};

function deriveImpact(
	recommendation: RecommendationRow,
	linkedFinding: FindingRow | undefined,
): ImpactLevel {
	if (linkedFinding?.severity === 'critical' || linkedFinding?.severity === 'high') {
		return 'High';
	}
	if (recommendation.priority === 'high') {
		return 'High';
	}
	if (recommendation.priority === 'low') {
		return 'Low';
	}
	return 'Medium';
}

function deriveEffort(linkedFinding: FindingRow | undefined): EffortLevel {
	if (!linkedFinding) {
		return 'Medium';
	}
	return CATEGORY_EFFORT[linkedFinding.category] ?? 'Medium';
}

export function prioritizeRecommendations(
	recommendations: RecommendationRow[],
	findings: FindingRow[],
): Recommendation[] {
	const findingsById = new Map(findings.map(f => [f.id, f]));

	const scored = recommendations.map(recommendation => {
		const linkedFinding = recommendation.finding_id
			? findingsById.get(recommendation.finding_id)
			: undefined;
		const impact = deriveImpact(recommendation, linkedFinding);
		const effort = deriveEffort(linkedFinding);
		const priorityScore = IMPACT_WEIGHT[impact] * 2 + EFFORT_WEIGHT[effort];

		return { recommendation, impact, effort, priorityScore };
	});

	scored.sort((a, b) => b.priorityScore - a.priorityScore);

	return scored.map(({ recommendation, impact, effort }, index) => ({
		id: recommendation.id,
		title: recommendation.recommendation,
		impactDescription: recommendation.expected_impact ?? 'Impact not yet assessed.',
		impact,
		effort,
		rank: index + 1,
	}));
}

// ---------------------------------------------------------------------------
// Knowledge gaps (mapping only -- these are already a flat list, no
// prioritization requested for them beyond what the dashboard already
// shows via Documentation / Knowledge Coverage scores).
// ---------------------------------------------------------------------------

export function mapKnowledgeGaps(gaps: KnowledgeGapRow[]): KnowledgeGap[] {
	return gaps
		.filter(gap => gap.status === 'open')
		.sort((a, b) => (b.occurrence_count ?? 0) - (a.occurrence_count ?? 0))
		.map(gap => ({
			id: gap.id,
			question: gap.question,
			occurrenceCount: gap.occurrence_count ?? 0,
			confidence: Math.round(gap.confidence_score ?? 0),
			recommendedDocument: gap.recommended_document,
			hasDocumentationPlan: Boolean(gap.recommended_document),
		}));
}

// ---------------------------------------------------------------------------
// Trend detection
//
// Compares the two most recent stored reports. Report-to-report (rather
// than "live vs. last report") so every number in the trend is anchored to
// an actual historical snapshot -- findings/gap counts are reconstructed
// "as of" each report's period_end from created_at, since Sentinel doesn't
// store point-in-time counts on the report row itself.
// ---------------------------------------------------------------------------

function countAsOf(
	rows: Array<{ created_at: string | null }>,
	asOfDate: string | null,
): number {
	if (!asOfDate) {
		return 0;
	}
	const cutoff = new Date(asOfDate).getTime();
	return rows.filter(row => row.created_at && new Date(row.created_at).getTime() <= cutoff).length;
}

function buildTrendPoint(current: number, previous: number): TrendPoint {
	return { current, previous, delta: current - previous };
}

export function calculateTrend(
	reports: ReportRow[],
	allCriticalFindings: FindingRow[],
	allKnowledgeGaps: KnowledgeGapRow[],
): Trend {
	if (reports.length < 2) {
		return {
			available: false,
			message:
				reports.length === 0
					? 'Trends will appear after Sentinel generates its first report.'
					: 'Trends will appear after Sentinel generates additional reports.',
		};
	}

	const sorted = [...reports].sort(
		(a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
	);
	const [latest, previous] = sorted;

	return {
		available: true,
		healthScore: buildTrendPoint(latest.health_score ?? 0, previous.health_score ?? 0),
		criticalFindings: buildTrendPoint(
			countAsOf(allCriticalFindings, latest.report_period_end),
			countAsOf(allCriticalFindings, previous.report_period_end),
		),
		knowledgeGaps: buildTrendPoint(
			countAsOf(allKnowledgeGaps, latest.report_period_end),
			countAsOf(allKnowledgeGaps, previous.report_period_end),
		),
	};
}

// ---------------------------------------------------------------------------
// Executive Summary v2
//
// Rule-based narrative built from branches over real signals (trend
// direction, category scores, top finding/recommendation). Still just
// string templating -- no generation model involved -- but the branching
// makes the output read like an analyst's note rather than a mail-merge.
// ---------------------------------------------------------------------------

export function generateExecutiveSummary(
	findings: FindingRow[],
	prioritizedFindings: Finding[],
	prioritizedRecommendations: Recommendation[],
	trend: Trend,
	currentScore: number,
): ExecutiveSummary {
	const openCount = findings.filter(f => f.status === 'open').length;

	if (openCount === 0) {
		return {
			summary:
				'Customer operations are healthy. Sentinel has not detected any open findings requiring attention right now.',
			keyTakeaway:
				'No action needed -- Sentinel will surface new findings here as soon as they are detected.',
			topRisks: [],
			potentialScoreGain: 0,
		};
	}

	const criticalCount = findings.filter(f => f.status === 'open' && f.severity === 'critical').length;
	const highCount = findings.filter(f => f.status === 'open' && f.severity === 'high').length;

	let openingSentence: string;
	if (trend.available && trend.healthScore) {
		const { delta } = trend.healthScore;
		if (delta > 0) {
			openingSentence = `Overall support health has improved since the previous report (+${delta} points).`;
		} else if (delta < 0) {
			openingSentence = `Overall support health has declined since the previous report (${delta} points).`;
		} else {
			openingSentence = 'Overall support health is unchanged since the previous report.';
		}
	} else {
		openingSentence = `Overall support health is currently ${currentScore}/100, based on ${openCount} open finding${openCount === 1 ? '' : 's'}.`;
	}

	let findingsSentence: string;
	if (trend.available && trend.criticalFindings) {
		const { current, delta } = trend.criticalFindings;
		if (delta < 0) {
			findingsSentence = `Critical issues have decreased to ${current}, but ${highCount + criticalCount} finding${highCount + criticalCount === 1 ? '' : 's'} still need attention.`;
		} else if (delta > 0) {
			findingsSentence = `Critical issues have increased to ${current}, requiring prompt attention.`;
		} else {
			findingsSentence = `Critical issues remain steady at ${current}.`;
		}
	} else {
		findingsSentence = `There ${criticalCount === 1 ? 'is' : 'are'} currently ${criticalCount} critical and ${highCount} high-priority finding${highCount === 1 ? '' : 's'} open.`;
	}

	const topFinding = prioritizedFindings[0];
	const topRecommendation = prioritizedRecommendations[0];

	const closingSentence = topFinding
		? `The top risk is "${topFinding.title}"${topFinding.reasons.includes('Recurring issue pattern') || topFinding.reasons.includes('Affected multiple reports') ? ', a recurring issue that continues to drive repeat customer questions' : ''}.`
		: '';

	const summary = [openingSentence, findingsSentence, closingSentence].filter(Boolean).join(' ');

	const keyTakeaway = topRecommendation
		? `Start with "${topRecommendation.title}" (${topRecommendation.impact} impact, ${topRecommendation.effort} effort). ${topRecommendation.impactDescription}`
		: `Investigate "${topFinding?.title ?? 'the top open finding'}" -- it is currently the highest-priority open issue.`;

	const topRisks = prioritizedFindings.slice(0, 3).map(f => f.title);

	// Estimate how many points the score would recover if the top 3
	// prioritized findings, and the pending recommendations tied to them,
	// were resolved. Purely illustrative and derived from the same
	// deterministic scoring function -- not a promise, a projection.
	const topFindingIds = new Set(prioritizedFindings.slice(0, 3).map(f => f.id));
	const remainingFindings = findings.filter(f => !topFindingIds.has(f.id));
	const projected = calculateHealthScore(remainingFindings, [], []);
	const potentialScoreGain = Math.max(0, projected.score - currentScore);

	return { summary, keyTakeaway, topRisks, potentialScoreGain };
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------

export interface DashboardCounts {
	criticalFindings: number;
	knowledgeGaps: number;
	recommendedActions: number;
	healthReports: number;
}

export interface DashboardMetrics {
	healthScore: HealthScore;
	executiveSummary: ExecutiveSummary;
	findings: Finding[];
	recommendations: Recommendation[];
	knowledgeGaps: KnowledgeGap[];
	trend: Trend;
	counts: DashboardCounts;
}

export function buildDashboardMetrics(input: {
	openFindings: FindingRow[];
	allFindings: FindingRow[];
	pendingRecommendations: RecommendationRow[];
	openKnowledgeGaps: KnowledgeGapRow[];
	allKnowledgeGaps: KnowledgeGapRow[];
	reports: ReportRow[];
	reportCount: number;
}): DashboardMetrics {
	const {
		openFindings,
		allFindings,
		pendingRecommendations,
		openKnowledgeGaps,
		allKnowledgeGaps,
		reports,
		reportCount,
	} = input;

	const { score, categories } = calculateHealthScore(
		openFindings,
		pendingRecommendations,
		openKnowledgeGaps,
	);

	const latestReport = [...reports].sort(
		(a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
	)[0];

	const findings = prioritizeFindings(openFindings, reports);
	const recommendations = prioritizeRecommendations(pendingRecommendations, openFindings);
	const knowledgeGaps = mapKnowledgeGaps(openKnowledgeGaps);
	const trend = calculateTrend(reports, allFindings.filter(f => f.severity === 'critical'), allKnowledgeGaps);
	const executiveSummary = generateExecutiveSummary(
		openFindings,
		findings,
		recommendations,
		trend,
		score,
	);

	return {
		healthScore: {
			score,
			previousScore: Math.round(latestReport?.health_score ?? score),
			categories,
		},
		executiveSummary,
		findings,
		recommendations,
		knowledgeGaps,
		trend,
		counts: {
			criticalFindings: openFindings.length,
			knowledgeGaps: openKnowledgeGaps.length,
			recommendedActions: pendingRecommendations.length,
			healthReports: reportCount,
		},
	};
}
