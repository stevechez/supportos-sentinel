import type { SentinelInsight } from './types';

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
