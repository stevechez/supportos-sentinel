import type { FindingRow, RecommendationRow, ReportRow } from './analysis';

// ---------------------------------------------------------------------------
// Phase 7 -- the operational improvement loop.
//
//   Detect -> Analyze -> Explain -> Act -> Measure improvement
//
// Everything in this file is deterministic (no AI, no network) and builds
// only on columns that already exist or were added by the minimal Phase 7
// migration (resolved_at/resolved_by on sentinel_findings, completed_at/
// completed_by on sentinel_recommendations). No new tables.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Lifecycle
//
// A simple forward-moving chain, not a general state machine -- matches
// Phase 7's explicit scope (no workflow automation). Both status columns
// are plain unconstrained text in the database; these are the only values
// the UI is allowed to set.
// ---------------------------------------------------------------------------

export type FindingLifecycleStatus = 'open' | 'acknowledged' | 'in_progress' | 'resolved';
export type RecommendationLifecycleStatus = 'pending' | 'in_progress' | 'completed';

export const FINDING_STATUS_ORDER: FindingLifecycleStatus[] = [
	'open',
	'acknowledged',
	'in_progress',
	'resolved',
];

// The database default/existing value is 'pending' (used throughout Phase
// 4/5 queries as "not yet completed") -- kept as-is rather than renamed to
// avoid touching every existing filter. Only the display label changes.
export const RECOMMENDATION_STATUS_ORDER: RecommendationLifecycleStatus[] = [
	'pending',
	'in_progress',
	'completed',
];

export const FINDING_STATUS_LABELS: Record<FindingLifecycleStatus, string> = {
	open: 'Open',
	acknowledged: 'Acknowledged',
	in_progress: 'In Progress',
	resolved: 'Resolved',
};

export const RECOMMENDATION_STATUS_LABELS: Record<RecommendationLifecycleStatus, string> = {
	pending: 'Not Started',
	in_progress: 'In Progress',
	completed: 'Completed',
};

function isFindingStatus(value: string): value is FindingLifecycleStatus {
	return (FINDING_STATUS_ORDER as string[]).includes(value);
}

function isRecommendationStatus(value: string): value is RecommendationLifecycleStatus {
	return (RECOMMENDATION_STATUS_ORDER as string[]).includes(value);
}

export function findingStatusLabel(status: string): string {
	return isFindingStatus(status) ? FINDING_STATUS_LABELS[status] : status;
}

export function recommendationStatusLabel(status: string): string {
	return isRecommendationStatus(status) ? RECOMMENDATION_STATUS_LABELS[status] : status;
}

/** "Active" findings are anything not yet resolved -- open, acknowledged, or in progress. */
export const ACTIVE_FINDING_STATUSES: FindingLifecycleStatus[] = ['open', 'acknowledged', 'in_progress'];

/** "Active" recommendations are anything not yet completed. */
export const ACTIVE_RECOMMENDATION_STATUSES: RecommendationLifecycleStatus[] = ['pending', 'in_progress'];

// ---------------------------------------------------------------------------
// Improvement history (Phase 7C)
//
// For a completed recommendation, reconstruct the health score "before"
// (the most recent stored report as of the moment it was completed) and
// "after" (the next stored report generated afterward, or the live current
// score if no later report exists yet). No new snapshot table -- this
// reuses sentinel_reports exactly the way Phase 5's trend detection does.
// ---------------------------------------------------------------------------

export interface ImprovementRecord {
	recommendationId: string;
	recommendationTitle: string;
	completedAt: string;
	healthScoreBefore: number | null;
	healthScoreAfter: number;
	delta: number | null;
	/** True when "after" came from a real later report rather than the live score. */
	measuredByReport: boolean;
}

export function calculateImprovement(
	recommendation: RecommendationRow,
	reports: ReportRow[],
	currentScore: number,
): ImprovementRecord | null {
	if (!recommendation.completed_at) {
		return null;
	}

	const completedAt = new Date(recommendation.completed_at).getTime();

	const before = [...reports]
		.filter(report => report.created_at && new Date(report.created_at).getTime() <= completedAt)
		.sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())[0];

	const after = [...reports]
		.filter(report => report.created_at && new Date(report.created_at).getTime() > completedAt)
		.sort((a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime())[0];

	const healthScoreBefore = before?.health_score ?? null;
	const healthScoreAfter = after?.health_score ?? currentScore;

	return {
		recommendationId: recommendation.id,
		recommendationTitle: recommendation.recommendation,
		completedAt: recommendation.completed_at,
		healthScoreBefore,
		healthScoreAfter,
		delta: healthScoreBefore !== null ? Math.round(healthScoreAfter - healthScoreBefore) : null,
		measuredByReport: Boolean(after),
	};
}

/** Improvement records for every completed recommendation, most recent first. */
export function calculateImprovementHistory(
	recommendations: RecommendationRow[],
	reports: ReportRow[],
	currentScore: number,
): ImprovementRecord[] {
	return recommendations
		.filter(r => r.status === 'completed' && r.completed_at)
		.map(r => calculateImprovement(r, reports, currentScore))
		.filter((record): record is ImprovementRecord => record !== null)
		.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
}

// ---------------------------------------------------------------------------
// Executive timeline (Phase 7E)
//
// A single chronological feed built entirely from existing rows: when a
// finding was detected, when it was resolved, when a recommendation was
// completed, and the health-score delta each time a new report was
// generated. No new table -- every event is derived from a timestamp that
// already exists.
// ---------------------------------------------------------------------------

export interface TimelineEvent {
	id: string;
	date: string;
	type: 'finding_detected' | 'finding_resolved' | 'recommendation_completed' | 'impact_measured';
	title: string;
	description: string;
}

export function buildExecutiveTimeline(
	findings: FindingRow[],
	recommendations: RecommendationRow[],
	reports: ReportRow[],
): TimelineEvent[] {
	const events: TimelineEvent[] = [];

	for (const finding of findings) {
		if (finding.created_at) {
			events.push({
				id: `finding-detected-${finding.id}`,
				date: finding.created_at,
				type: 'finding_detected',
				title: `${capitalize(finding.severity)} issue detected`,
				description: finding.title,
			});
		}
		if (finding.status === 'resolved' && finding.resolved_at) {
			events.push({
				id: `finding-resolved-${finding.id}`,
				date: finding.resolved_at,
				type: 'finding_resolved',
				title: 'Finding resolved',
				description: finding.title,
			});
		}
	}

	for (const recommendation of recommendations) {
		if (recommendation.status === 'completed' && recommendation.completed_at) {
			events.push({
				id: `recommendation-completed-${recommendation.id}`,
				date: recommendation.completed_at,
				type: 'recommendation_completed',
				title: 'Recommendation completed',
				description: recommendation.recommendation,
			});
		}
	}

	const sortedReports = [...reports].sort(
		(a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime(),
	);

	for (let i = 1; i < sortedReports.length; i++) {
		const previous = sortedReports[i - 1];
		const current = sortedReports[i];

		if (current.created_at && previous.health_score != null && current.health_score != null) {
			const delta = Math.round(current.health_score - previous.health_score);
			events.push({
				id: `impact-measured-${current.id}`,
				date: current.created_at,
				type: 'impact_measured',
				title: 'Impact measured',
				description:
					delta === 0
						? 'Health score held steady this period.'
						: `Health score ${delta > 0 ? 'improved' : 'declined'} ${Math.abs(delta)} points this period.`,
			});
		}
	}

	return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function capitalize(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
