import type {
	HistoricalInsight,
	ImprovementInsight,
	SentinelInsight,
	SignalPatternInsight,
	WelcomeInsight,
} from './types';

// Prompt design (Phase 6 Workstream 4). The AI is cast as an operations
// advisor writing for a company executive, not a general-purpose data
// analyst -- the goal is a leadership-ready explanation of conclusions
// Sentinel has already reached, not a request to analyze anything.

export const EXECUTIVE_ANALYST_SYSTEM_PROMPT =
	'You are an operations advisor for SupportOS Sentinel. You explain a ' +
	"support operation's health report to a company executive. Focus on " +
	'business impact and recommended next steps, not technical detail. Be ' +
	'concise, concrete, and avoid hype or filler phrases. You only know what ' +
	"is in the report provided to you -- never invent findings, numbers, or " +
	'facts that are not present in it.';

const RESPONSE_SCHEMA_INSTRUCTIONS = `Respond with ONLY a single JSON object, no markdown fences, no commentary before or after it, matching exactly this shape:
{
  "summary": string (2-3 sentences, plain language, for a non-technical executive),
  "improvements": string[] (0-3 short items -- what got better, omit if nothing improved),
  "risks": string[] (1-3 short items -- the biggest remaining risks, most important first),
  "priorities": string[] (1-3 short items -- what to do next, most important first)
}`;

/**
 * Builds the user-turn prompt from a SentinelInsight. Defensively caps each
 * list at 3 items even though callers are expected to have already
 * summarized down to the top items -- the prompt sent to the model should
 * never grow unbounded regardless of what's upstream.
 */
export function buildExecutiveBriefPrompt(insight: SentinelInsight): string {
	const criticalIssues = insight.criticalIssues.slice(0, 3);
	const recommendedActions = insight.recommendedActions.slice(0, 3);
	const businessImpact = insight.businessImpact.slice(0, 3);

	const report = {
		healthScore: insight.healthScore,
		trend: insight.trend,
		criticalIssues,
		recommendedActions,
		businessImpact,
	};

	return [
		'Here is the current Sentinel health report, already analyzed by our scoring engine:',
		'',
		JSON.stringify(report, null, 2),
		'',
		'Write the executive brief for this report.',
		'',
		RESPONSE_SCHEMA_INSTRUCTIONS,
	].join('\n');
}

// ---------------------------------------------------------------------------
// Phase 7D -- Improvement Advisor
//
// A narrower prompt than the executive brief: the model is only ever asked
// to explain an already-measured result (a completed action and the
// before/after health score Sentinel's scoring engine computed around it),
// never to estimate or predict one. "The system calculates, AI explains" --
// this prompt has no room for the model to do the calculating.
// ---------------------------------------------------------------------------

export const IMPROVEMENT_ADVISOR_SYSTEM_PROMPT =
	'You are an operations advisor for SupportOS Sentinel. A team just completed ' +
	"a recommended action, and Sentinel's scoring engine has already measured " +
	'the before/after health score change. Explain what happened in plain ' +
	'language for a company executive, in the past tense, as a completed result ' +
	'-- never as a prediction or estimate. If no after-score has been measured ' +
	'by a later report yet, say so plainly rather than implying a final result. ' +
	'Be concise and concrete. You only know what is in the data provided -- ' +
	'never invent numbers or facts that are not present in it.';

const IMPROVEMENT_RESPONSE_SCHEMA_INSTRUCTIONS = `Respond with ONLY a single JSON object, no markdown fences, no commentary before or after it, matching exactly this shape:
{
  "summary": string (1-2 sentences, plain language, past tense, for a non-technical executive),
  "estimatedImpact": string (a short phrase describing the measured health score change, e.g. "+8 points" or "Not yet measurable" if there is no after-score yet)
}`;

export function buildImprovementExplanationPrompt(insight: ImprovementInsight): string {
	const result = {
		actionTitle: insight.actionTitle,
		relatedFinding: insight.relatedFindingTitle,
		healthScoreBefore: insight.healthScoreBefore,
		healthScoreAfter: insight.healthScoreAfter,
		delta: insight.delta,
		measuredByReport: insight.measuredByReport,
	};

	return [
		'Here is a completed action and its measured effect on the health score:',
		'',
		JSON.stringify(result, null, 2),
		'',
		'Explain this result for a company executive.',
		'',
		IMPROVEMENT_RESPONSE_SCHEMA_INSTRUCTIONS,
	].join('\n');
}

// ---------------------------------------------------------------------------
// Phase 8E -- explaining a detected signal pattern.
//
// Signals -> deterministic grouping -> candidate pattern -> AI explanation.
// The model is only ever handed a pattern that already crossed the
// recurrence threshold in code (src/lib/signals/patterns.ts) -- it never
// sees raw signals and never decides what counts as recurring.
// ---------------------------------------------------------------------------

export const SIGNAL_PATTERN_SYSTEM_PROMPT =
	'You are an operations advisor for SupportOS Sentinel. Sentinel has ' +
	'deterministically detected a recurring pattern across several ' +
	'operational signals (tickets, conversations, feedback, or similar) ' +
	'logged by the team. Explain in one or two sentences, for a company ' +
	'executive, what this recurring pattern likely means operationally. Be ' +
	'concise and concrete. You only know the pattern statistics provided --' +
	' never invent specifics that are not present in them.';

const SIGNAL_PATTERN_RESPONSE_SCHEMA_INSTRUCTIONS = `Respond with ONLY a single JSON object, no markdown fences, no commentary before or after it, matching exactly this shape:
{
  "summary": string (1-2 sentences, plain language, for a non-technical executive)
}`;

export function buildSignalPatternExplanationPrompt(insight: SignalPatternInsight): string {
	return [
		'Here is a recurring pattern Sentinel detected across operational signals:',
		'',
		JSON.stringify(insight, null, 2),
		'',
		'Explain what this pattern likely means for the business.',
		'',
		SIGNAL_PATTERN_RESPONSE_SCHEMA_INSTRUCTIONS,
	].join('\n');
}

// ---------------------------------------------------------------------------
// Phase 10F -- the AI Executive Welcome Brief.
//
// Shown once, right after a brand-new customer's first sync. Same
// boundary discipline as every prompt above: the model only receives
// counts and a title src/lib/signals/insight.ts already computed
// deterministically. It explains the customer's first data, it does not
// discover it.
// ---------------------------------------------------------------------------

export const WELCOME_BRIEF_SYSTEM_PROMPT =
	'You are an operations advisor for SupportOS Sentinel, writing the ' +
	"first message a brand-new customer sees after connecting their " +
	"support data. Be warm but concise, and lead with what Sentinel " +
	'already found -- this is meant to feel like an immediate "aha ' +
	"moment,\" not a generic welcome. You only know the counts and title " +
	'provided -- never invent findings, numbers, or facts that are not ' +
	'present in them.';

const WELCOME_BRIEF_RESPONSE_SCHEMA_INSTRUCTIONS = `Respond with ONLY a single JSON object, no markdown fences, no commentary before or after it, matching exactly this shape:
{
  "summary": string (2-3 sentences, welcoming but concrete, describing what Sentinel found in this first sync),
  "highestOpportunity": string (one short phrase naming the single biggest opportunity, e.g. "Improve password reset self-service documentation")
}`;

export function buildWelcomeBriefPrompt(insight: WelcomeInsight): string {
	return [
		"Here is a new customer's first sync into Sentinel:",
		'',
		JSON.stringify(insight, null, 2),
		'',
		'Write their welcome brief.',
		'',
		WELCOME_BRIEF_RESPONSE_SCHEMA_INSTRUCTIONS,
	].join('\n');
}

// ---------------------------------------------------------------------------
// Phase 12F -- the AI historical advisor.
//
// Database facts -> deterministic memory retrieval (src/lib/dashboard/
// memory.ts's word-overlap match) -> AI explanation. The model only ever
// receives a current issue title, a previous resolution title, and a
// measured result string -- it never searches history, never decides
// what counts as similar, and never invents a metric that wasn't in the
// measured result it was handed.
// ---------------------------------------------------------------------------

export const HISTORICAL_ADVISOR_SYSTEM_PROMPT =
	'You are an operations advisor for SupportOS Sentinel. Sentinel has ' +
	"deterministically matched a new operational issue to a similar issue " +
	'the organization already resolved before, using the exact titles and ' +
	'measured result given to you. Explain in one or two sentences, for a ' +
	'company executive, what worked before and why it is worth considering ' +
	'again now. Be concise and concrete. You only know the titles and ' +
	'measured result provided -- never invent numbers, causes, or facts ' +
	'that are not present in them.';

const HISTORICAL_ADVISOR_RESPONSE_SCHEMA_INSTRUCTIONS = `Respond with ONLY a single JSON object, no markdown fences, no commentary before or after it, matching exactly this shape:
{
  "explanation": string (1-2 sentences, plain language, for a non-technical executive)
}`;

export function buildHistoricalAdvicePrompt(insight: HistoricalInsight): string {
	return [
		'Sentinel matched a new issue to something the organization already solved before:',
		'',
		JSON.stringify(insight, null, 2),
		'',
		'Explain what worked before and why it may be worth trying again.',
		'',
		HISTORICAL_ADVISOR_RESPONSE_SCHEMA_INSTRUCTIONS,
	].join('\n');
}
