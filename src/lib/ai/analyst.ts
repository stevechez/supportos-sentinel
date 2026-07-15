import { serverEnv } from '@supportos/config/env/server';

import type { DashboardMetrics } from '@/lib/dashboard/analysis';
import type { ImprovementRecord } from '@/lib/dashboard/improvement';
import type { SimilarResolution } from '@/lib/dashboard/memory';
import type { EmergingRisk } from '@/lib/signals/risks';
import type { FirstInsightSummary } from '@/lib/signals/insight';
import type { SignalPattern } from '@/lib/signals/patterns';

import {
	buildCustomerAssistantPrompt,
	buildEmergingRiskExplanationPrompt,
	buildExecutiveBriefPrompt,
	buildHistoricalAdvicePrompt,
	buildImprovementExplanationPrompt,
	buildSignalPatternExplanationPrompt,
	buildWelcomeBriefPrompt,
	CUSTOMER_ASSISTANT_SYSTEM_PROMPT,
	EMERGING_RISK_ADVISOR_SYSTEM_PROMPT,
	EXECUTIVE_ANALYST_SYSTEM_PROMPT,
	HISTORICAL_ADVISOR_SYSTEM_PROMPT,
	IMPROVEMENT_ADVISOR_SYSTEM_PROMPT,
	SIGNAL_PATTERN_SYSTEM_PROMPT,
	WELCOME_BRIEF_SYSTEM_PROMPT,
} from './prompts';
import {
	AiUnavailableError,
	type CustomerAnswer,
	type CustomerQuestionInsight,
	type EmergingRiskExplanation,
	type EmergingRiskInsight,
	type ExecutiveBrief,
	type HistoricalAdvice,
	type HistoricalInsight,
	type ImprovementExplanation,
	type ImprovementInsight,
	type SentinelInsight,
	type SignalPatternExplanation,
	type SignalPatternInsight,
	type WelcomeBrief,
	type WelcomeInsight,
} from './types';

// ---------------------------------------------------------------------------
// Database -> Sentinel Analysis Engine -> SentinelInsight -> AI Analyst -> ExecutiveBrief
// Database -> improvement.ts -> ImprovementInsight -> AI Analyst -> ImprovementExplanation
//
// Everything above this file (src/lib/dashboard/*) computes. Everything in
// this file only explains what was already computed. The two
// build*Insight functions are pure, with no network access; the two
// generate* functions are the only things here that talk to a model, and
// each only ever receives the insight this file itself built -- never raw
// rows.
// ---------------------------------------------------------------------------

/** How many items of each list are worth showing an executive at all. */
const MAX_ITEMS = 3;

function formatTrend(metrics: DashboardMetrics): string | null {
	if (!metrics.trend.available || !metrics.trend.healthScore) {
		return null;
	}
	const { delta } = metrics.trend.healthScore;
	if (delta === 0) {
		return '0';
	}
	return delta > 0 ? `+${delta}` : `${delta}`;
}

/**
 * Pure transform from the dashboard's existing DashboardMetrics (Phase 5's
 * analysis engine output) into the SentinelInsight the AI is allowed to
 * see. No new calculation happens here -- every value already exists on
 * `metrics`. This is the "Insight Contract" boundary: nothing crosses it
 * that isn't already a conclusion, and nothing raw (row ids, full
 * descriptions, org ids) crosses it at all.
 */
export function buildSentinelInsight(metrics: DashboardMetrics): SentinelInsight {
	const criticalIssues = metrics.findings.slice(0, MAX_ITEMS).map(finding => ({
		title: finding.title,
		severity: finding.severity.toLowerCase() as 'critical' | 'high' | 'medium',
		age: finding.detected,
	}));

	const recommendedActions = metrics.recommendations.slice(0, MAX_ITEMS).map(recommendation => ({
		title: recommendation.title,
		impact: recommendation.impact,
	}));

	const businessImpact = metrics.findings
		.slice(0, MAX_ITEMS)
		.map(finding => finding.businessImpact)
		.filter((impact): impact is string => Boolean(impact));

	return {
		healthScore: metrics.healthScore.score,
		trend: formatTrend(metrics),
		criticalIssues,
		recommendedActions,
		businessImpact,
	};
}

/**
 * Pure transform from a Phase 7C ImprovementRecord (already-computed
 * before/after health score around a completed recommendation) into the
 * Phase 7D ImprovementInsight. No calculation happens here either -- the
 * before/after numbers and the delta were already computed by
 * improvement.ts's calculateImprovement().
 */
export function buildImprovementInsight(
	record: ImprovementRecord,
	relatedFindingTitle: string | null,
): ImprovementInsight {
	return {
		actionTitle: record.recommendationTitle,
		relatedFindingTitle,
		healthScoreBefore: record.healthScoreBefore,
		healthScoreAfter: record.healthScoreAfter,
		delta: record.delta,
		measuredByReport: record.measuredByReport,
	};
}

/**
 * Pure transform from a Phase 8D SignalPattern (already-detected
 * deterministically) into the Phase 8E SignalPatternInsight. No grouping
 * or clustering happens here -- that's entirely patterns.ts's job.
 */
export function buildSignalPatternInsight(pattern: SignalPattern): SignalPatternInsight {
	return {
		type: pattern.type,
		title: pattern.title,
		recurrenceCount: pattern.recurrenceCount,
		daySpan: pattern.daySpan,
	};
}

/**
 * Pure transform from a Phase 10D FirstInsightSummary (already computed
 * over Phase 8's signals/patterns) into the Phase 10F WelcomeInsight. No
 * calculation happens here -- the counts and top pattern title already
 * exist on `summary`.
 */
export function buildWelcomeInsight(summary: FirstInsightSummary): WelcomeInsight {
	return {
		signalCount: summary.signalCount,
		recurringIssueCount: summary.recurringIssueCount,
		knowledgeGapCount: summary.knowledgeGapCount,
		topIssueTitle: summary.topPattern?.title ?? null,
	};
}

/**
 * Pure transform from a Phase 12C SimilarResolution (already matched
 * deterministically by src/lib/dashboard/memory.ts's word-overlap
 * similarity) into the Phase 12F HistoricalInsight. No searching or
 * matching happens here -- that's entirely memory.ts's job.
 */
export function buildHistoricalInsight(candidateTitle: string, match: SimilarResolution): HistoricalInsight {
	return {
		currentIssueTitle: candidateTitle,
		previousResolutionTitle: match.event.actionTaken,
		measuredResult: match.event.impactSummary,
	};
}

/**
 * Pure transform from a Phase 14B EmergingRisk (already assembled
 * deterministically by src/lib/signals/risks.ts, from trends.ts's counting
 * and memory.ts's similarity match) into the Phase 14E EmergingRiskInsight.
 * No trend detection or memory search happens here -- that's entirely
 * risks.ts's job.
 */
export function buildEmergingRiskInsight(risk: EmergingRisk): EmergingRiskInsight {
	return {
		title: risk.title,
		evidence: risk.evidence,
		severity: risk.severity,
		confidence: risk.confidence,
		priorResolution: risk.priorResolution
			? { actionTaken: risk.priorResolution.actionTaken, impactSummary: risk.priorResolution.impactSummary }
			: null,
	};
}

// ---------------------------------------------------------------------------
// LLM call
// ---------------------------------------------------------------------------

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

// Cost controls (Phase 6 Workstream 6): a hard cap on output tokens bounds
// the cost of every single call regardless of input size, and a request
// timeout guarantees a slow/hanging model call can never hang a button
// forever -- it fails fast into the graceful-failure path below instead.
const MAX_OUTPUT_TOKENS = 500;
const REQUEST_TIMEOUT_MS = 20_000;

interface AnthropicMessageResponse {
	content?: Array<{ type: string; text?: string }>;
}

function extractJson(text: string): unknown {
	// Models occasionally wrap JSON in markdown fences despite instructions
	// not to -- strip those defensively before parsing rather than failing
	// the whole call over formatting.
	const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
	return JSON.parse(cleaned);
}

/**
 * Shared low-level call: sends a system + user prompt to the configured
 * model and returns the parsed-but-unvalidated JSON response. Every
 * failure path (missing config, network failure, bad status, unreadable
 * body, malformed JSON) normalizes to AiUnavailableError. Callers are
 * responsible for validating the shape of what comes back -- this function
 * doesn't know what shape to expect.
 */
async function callAnthropicForJson(systemPrompt: string, userPrompt: string): Promise<unknown> {
	const apiKey = serverEnv.anthropicApiKey;

	if (!apiKey) {
		throw new AiUnavailableError('AI is not configured for this workspace yet.');
	}

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	let response: Response;
	try {
		response = await fetch(ANTHROPIC_API_URL, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'x-api-key': apiKey,
				'anthropic-version': ANTHROPIC_VERSION,
			},
			body: JSON.stringify({
				model: serverEnv.anthropicModel,
				max_tokens: MAX_OUTPUT_TOKENS,
				system: systemPrompt,
				messages: [{ role: 'user', content: userPrompt }],
			}),
			signal: controller.signal,
		});
	} catch (cause) {
		throw new AiUnavailableError('Could not reach the AI service. Please try again.', cause);
	} finally {
		clearTimeout(timeout);
	}

	if (!response.ok) {
		throw new AiUnavailableError('The AI service returned an error. Please try again.', `HTTP ${response.status}`);
	}

	let payload: AnthropicMessageResponse;
	try {
		payload = await response.json();
	} catch (cause) {
		throw new AiUnavailableError('The AI service returned an unreadable response.', cause);
	}

	const text = payload.content?.find(block => block.type === 'text')?.text;
	if (!text) {
		throw new AiUnavailableError('The AI service returned an empty response.');
	}

	try {
		return extractJson(text);
	} catch (cause) {
		throw new AiUnavailableError('The AI service returned an invalid response.', cause);
	}
}

function isStringArray(value: unknown): value is string[] {
	return Array.isArray(value) && value.every(item => typeof item === 'string');
}

function isExecutiveBrief(value: unknown): value is ExecutiveBrief {
	if (!value || typeof value !== 'object') {
		return false;
	}
	const candidate = value as Record<string, unknown>;
	return (
		typeof candidate.summary === 'string' &&
		candidate.summary.trim().length > 0 &&
		isStringArray(candidate.improvements) &&
		isStringArray(candidate.risks) &&
		isStringArray(candidate.priorities)
	);
}

function isImprovementExplanation(value: unknown): value is ImprovementExplanation {
	if (!value || typeof value !== 'object') {
		return false;
	}
	const candidate = value as Record<string, unknown>;
	return (
		typeof candidate.summary === 'string' &&
		candidate.summary.trim().length > 0 &&
		typeof candidate.estimatedImpact === 'string' &&
		candidate.estimatedImpact.trim().length > 0
	);
}

function isSignalPatternExplanation(value: unknown): value is SignalPatternExplanation {
	if (!value || typeof value !== 'object') {
		return false;
	}
	const candidate = value as Record<string, unknown>;
	return typeof candidate.summary === 'string' && candidate.summary.trim().length > 0;
}

function isWelcomeBrief(value: unknown): value is WelcomeBrief {
	if (!value || typeof value !== 'object') {
		return false;
	}
	const candidate = value as Record<string, unknown>;
	return (
		typeof candidate.summary === 'string' &&
		candidate.summary.trim().length > 0 &&
		typeof candidate.highestOpportunity === 'string' &&
		candidate.highestOpportunity.trim().length > 0
	);
}

function isHistoricalAdvice(value: unknown): value is HistoricalAdvice {
	if (!value || typeof value !== 'object') {
		return false;
	}
	const candidate = value as Record<string, unknown>;
	return typeof candidate.explanation === 'string' && candidate.explanation.trim().length > 0;
}

function isEmergingRiskExplanation(value: unknown): value is EmergingRiskExplanation {
	if (!value || typeof value !== 'object') {
		return false;
	}
	const candidate = value as Record<string, unknown>;
	return typeof candidate.explanation === 'string' && candidate.explanation.trim().length > 0;
}

/**
 * Calls the configured model to turn a SentinelInsight into an
 * ExecutiveBrief. Never throws a raw/unexpected error -- schema-invalid
 * responses normalize to AiUnavailableError, same as every other failure
 * path in callAnthropicForJson.
 */
export async function generateExecutiveBrief(insight: SentinelInsight): Promise<ExecutiveBrief> {
	const parsed = await callAnthropicForJson(
		EXECUTIVE_ANALYST_SYSTEM_PROMPT,
		buildExecutiveBriefPrompt(insight),
	);

	if (!isExecutiveBrief(parsed)) {
		throw new AiUnavailableError('The AI service returned an unexpected response shape.');
	}

	return {
		summary: parsed.summary,
		improvements: parsed.improvements.slice(0, MAX_ITEMS),
		risks: parsed.risks.slice(0, MAX_ITEMS),
		priorities: parsed.priorities.slice(0, MAX_ITEMS),
	};
}

/**
 * Phase 7D: calls the configured model to explain an already-measured
 * improvement. Same failure-handling discipline as generateExecutiveBrief.
 */
export async function generateImprovementExplanation(
	insight: ImprovementInsight,
): Promise<ImprovementExplanation> {
	const parsed = await callAnthropicForJson(
		IMPROVEMENT_ADVISOR_SYSTEM_PROMPT,
		buildImprovementExplanationPrompt(insight),
	);

	if (!isImprovementExplanation(parsed)) {
		throw new AiUnavailableError('The AI service returned an unexpected response shape.');
	}

	return { summary: parsed.summary, estimatedImpact: parsed.estimatedImpact };
}

/**
 * Phase 8E: calls the configured model to explain a deterministically
 * detected signal pattern. Same failure-handling discipline as every other
 * generate* function here.
 */
export async function generateSignalPatternExplanation(
	insight: SignalPatternInsight,
): Promise<SignalPatternExplanation> {
	const parsed = await callAnthropicForJson(
		SIGNAL_PATTERN_SYSTEM_PROMPT,
		buildSignalPatternExplanationPrompt(insight),
	);

	if (!isSignalPatternExplanation(parsed)) {
		throw new AiUnavailableError('The AI service returned an unexpected response shape.');
	}

	return { summary: parsed.summary };
}

/**
 * Phase 10F: calls the configured model to write a brand-new customer's
 * welcome brief from their first sync. Same failure-handling discipline
 * as every other generate* function here.
 */
export async function generateWelcomeBrief(insight: WelcomeInsight): Promise<WelcomeBrief> {
	const parsed = await callAnthropicForJson(WELCOME_BRIEF_SYSTEM_PROMPT, buildWelcomeBriefPrompt(insight));

	if (!isWelcomeBrief(parsed)) {
		throw new AiUnavailableError('The AI service returned an unexpected response shape.');
	}

	return { summary: parsed.summary, highestOpportunity: parsed.highestOpportunity };
}

/**
 * Phase 12F: calls the configured model to explain a deterministically
 * matched historical resolution. Same failure-handling discipline as
 * every other generate* function here.
 */
export async function generateHistoricalAdvice(insight: HistoricalInsight): Promise<HistoricalAdvice> {
	const parsed = await callAnthropicForJson(HISTORICAL_ADVISOR_SYSTEM_PROMPT, buildHistoricalAdvicePrompt(insight));

	if (!isHistoricalAdvice(parsed)) {
		throw new AiUnavailableError('The AI service returned an unexpected response shape.');
	}

	return { explanation: parsed.explanation };
}

/**
 * Phase 14E: calls the configured model to explain a deterministically
 * detected emerging risk. Same failure-handling discipline as every other
 * generate* function here.
 */
export async function generateEmergingRiskExplanation(
	insight: EmergingRiskInsight,
): Promise<EmergingRiskExplanation> {
	const parsed = await callAnthropicForJson(
		EMERGING_RISK_ADVISOR_SYSTEM_PROMPT,
		buildEmergingRiskExplanationPrompt(insight),
	);

	if (!isEmergingRiskExplanation(parsed)) {
		throw new AiUnavailableError('The AI service returned an unexpected response shape.');
	}

	return { explanation: parsed.explanation };
}

function isCustomerAnswer(value: unknown): value is CustomerAnswer {
	if (!value || typeof value !== 'object') {
		return false;
	}
	const candidate = value as Record<string, unknown>;
	return typeof candidate.answer === 'string' && candidate.answer.trim().length > 0;
}

/**
 * Phase 21D: calls the configured model to answer a customer's question
 * directly. Unlike every other generate* function in this file, there is
 * no deterministic pre-computation behind this call -- the model is
 * actually generating the answer, not explaining one. Same failure-
 * handling discipline as everywhere else (any failure normalizes to
 * AiUnavailableError); callers are responsible for writing the resulting
 * answer to a real, reviewable message row rather than treating it as an
 * automatic action.
 */
export async function generateCustomerAnswer(insight: CustomerQuestionInsight): Promise<CustomerAnswer> {
	const parsed = await callAnthropicForJson(
		CUSTOMER_ASSISTANT_SYSTEM_PROMPT,
		buildCustomerAssistantPrompt(insight),
	);

	if (!isCustomerAnswer(parsed)) {
		throw new AiUnavailableError('The AI service returned an unexpected response shape.');
	}

	return { answer: parsed.answer };
}
