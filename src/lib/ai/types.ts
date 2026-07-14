// The AI boundary's type contracts.
//
// Two directions of data cross this boundary, and both are structured,
// typed, and small -- never raw database rows, never free-form blobs.
//
//   Sentinel Analysis Engine -> SentinelInsight -> AI Analyst -> ExecutiveBrief
//
// Code calculates (analysis.ts). AI explains (analyst.ts). This file only
// describes the shapes on either side of that handoff.

/** A single open finding, reduced to what an executive needs to hear about it. */
export interface SentinelInsightFinding {
	title: string;
	severity: 'critical' | 'high' | 'medium';
	/** Human-readable age, e.g. "21 days". Already formatted -- no raw dates. */
	age: string;
}

/** A single pending recommendation, reduced the same way. */
export interface SentinelInsightRecommendation {
	title: string;
	impact: 'High' | 'Medium' | 'Low';
}

/**
 * SentinelInsight -- the "Insight Contract" from the Phase 6 handoff.
 *
 * This is the entire surface area the AI is allowed to see. It is built by
 * a pure function (`buildSentinelInsight`) over the same DashboardMetrics
 * the rest of the dashboard already renders -- nothing new is computed for
 * the AI, and nothing raw (row ids, org ids, full finding descriptions) is
 * exposed to it. If a field isn't in this interface, the AI never sees it.
 */
export interface SentinelInsight {
	healthScore: number;
	/** Signed, formatted trend string, e.g. "+7" or "-3", or null if fewer than two reports exist yet. */
	trend: string | null;
	criticalIssues: SentinelInsightFinding[];
	recommendedActions: SentinelInsightRecommendation[];
	/** Short business-impact sentences pulled from the top findings, already written for a human reader. */
	businessImpact: string[];
}

/**
 * ExecutiveBrief -- the AI's entire output contract. Deliberately not a
 * free-form string: every field is a short string or a short list of short
 * strings, so the UI can render it predictably and a malformed response is
 * easy to detect and reject rather than silently displayed.
 */
export interface ExecutiveBrief {
	summary: string;
	improvements: string[];
	risks: string[];
	priorities: string[];
}

/**
 * ImprovementInsight -- the Phase 7D input contract. Built the same way as
 * SentinelInsight: a pure transform over an already-completed action and
 * the deterministic before/after health score improvement.ts computed for
 * it. The AI explains a measured result here; it never estimates one.
 */
export interface ImprovementInsight {
	actionTitle: string;
	relatedFindingTitle: string | null;
	healthScoreBefore: number | null;
	healthScoreAfter: number;
	delta: number | null;
	/** False when "after" is today's live score rather than a later report -- lets the AI hedge appropriately. */
	measuredByReport: boolean;
}

/** Phase 7D's output contract -- small and typed, same discipline as ExecutiveBrief. */
export interface ImprovementExplanation {
	summary: string;
	estimatedImpact: string;
}

/**
 * SignalPatternInsight -- the Phase 8E input contract. Built the same way
 * as every other insight in this file: a pure transform over a pattern
 * src/lib/signals/patterns.ts already detected deterministically. The AI
 * explains a pattern that grouping already found; it never does the
 * grouping or decides what counts as a pattern itself.
 */
export interface SignalPatternInsight {
	type: string;
	title: string;
	recurrenceCount: number;
	daySpan: number;
}

/** Phase 8E's output contract -- one explanatory sentence, same discipline as every other AI output here. */
export interface SignalPatternExplanation {
	summary: string;
}

/**
 * Thrown for any failure in the AI boundary -- missing configuration,
 * network failure, non-200 response, malformed/invalid JSON. Always carries
 * a generic, user-safe message; the real cause is attached for server-side
 * logging only. Callers should catch this specifically and degrade
 * gracefully (per Phase 6 Workstream 6) rather than let it propagate to an
 * error boundary -- an AI failure should never make the rest of the
 * dashboard unusable.
 */
export class AiUnavailableError extends Error {
	constructor(message: string, cause?: unknown) {
		super(message);
		this.name = 'AiUnavailableError';
		if (cause !== undefined) {
			this.cause = cause;
		}
	}
}
