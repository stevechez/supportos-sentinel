'use server';

import { createClient } from '@supportos/auth/server';

import { getCurrentMembership, getExecutiveDashboardData } from '@/lib/dashboard/dashboard';
import { findSimilarPastResolutions } from '@/lib/dashboard/memory';
import { getSignalsOverview } from '@/lib/signals/data';
import { buildFirstInsightSummary } from '@/lib/signals/insight';
import { buildPattern, MIN_RECURRENCE } from '@/lib/signals/patterns';
import type { OperationalSignal } from '@/lib/signals/types';

import {
	buildHistoricalInsight,
	buildImprovementInsight,
	buildSentinelInsight,
	buildSignalPatternInsight,
	buildWelcomeInsight,
	generateExecutiveBrief,
	generateHistoricalAdvice,
	generateImprovementExplanation,
	generateSignalPatternExplanation,
	generateWelcomeBrief,
} from './analyst';
import {
	AiUnavailableError,
	type ExecutiveBrief,
	type HistoricalAdvice,
	type ImprovementExplanation,
	type SignalPatternExplanation,
	type WelcomeBrief,
} from './types';

export type GenerateExecutiveBriefResult =
	| { ok: true; brief: ExecutiveBrief }
	| { ok: false; error: string };

export type GenerateImprovementExplanationResult =
	| { ok: true; explanation: ImprovementExplanation }
	| { ok: false; error: string };

export type ExplainSignalPatternResult =
	| { ok: true; explanation: SignalPatternExplanation }
	| { ok: false; error: string };

export type GenerateWelcomeBriefResult =
	| { ok: true; brief: WelcomeBrief }
	| { ok: false; error: string };

export type ExplainHistoricalMatchResult =
	| { ok: true; advice: HistoricalAdvice }
	| { ok: false; error: string };

/**
 * Server Action behind the "Generate AI Brief" button. Always returns a
 * result object rather than throwing -- an AI failure is communicated back
 * to the card that called it and rendered inline, it never propagates up
 * to the (dashboard)/error.tsx boundary. The rest of the dashboard must
 * stay fully usable no matter what happens here (Phase 6 Workstream 6).
 */
export async function generateExecutiveBriefAction(): Promise<GenerateExecutiveBriefResult> {
	try {
		const metrics = await getExecutiveDashboardData();

		if (!metrics) {
			return { ok: false, error: "We couldn't find your organization's data." };
		}

		const insight = buildSentinelInsight(metrics);
		const brief = await generateExecutiveBrief(insight);

		return { ok: true, brief };
	} catch (error) {
		if (error instanceof AiUnavailableError) {
			return { ok: false, error: error.message };
		}

		console.error('[ai] unexpected error generating executive brief:', error);
		return { ok: false, error: 'Something went wrong generating the brief. Please try again.' };
	}
}

/**
 * Server Action behind "Explain this improvement" (Phase 7D). Takes the id
 * of a completed recommendation, finds the deterministic before/after
 * health score improvement.ts already computed for it, and asks the AI to
 * explain that measured result -- the AI never recomputes or estimates the
 * numbers itself. Same never-throw-across-the-boundary discipline as
 * generateExecutiveBriefAction.
 */
export async function generateImprovementExplanationAction(
	recommendationId: string,
): Promise<GenerateImprovementExplanationResult> {
	try {
		const membership = await getCurrentMembership();
		if (!membership) {
			return { ok: false, error: "We couldn't find your organization's data." };
		}

		const metrics = await getExecutiveDashboardData();
		if (!metrics) {
			return { ok: false, error: "We couldn't find your organization's data." };
		}

		const record = metrics.improvementHistory.find(r => r.recommendationId === recommendationId);
		if (!record) {
			return { ok: false, error: 'This recommendation has not been completed yet.' };
		}

		const supabase = await createClient();
		const { data: recommendation } = await supabase
			.from('sentinel_recommendations')
			.select('finding_id')
			.eq('id', recommendationId)
			.eq('organization_id', membership.organizationId)
			.maybeSingle();

		let relatedFindingTitle: string | null = null;
		if (recommendation?.finding_id) {
			const { data: finding } = await supabase
				.from('sentinel_findings')
				.select('title')
				.eq('id', recommendation.finding_id)
				.eq('organization_id', membership.organizationId)
				.maybeSingle();
			relatedFindingTitle = finding?.title ?? null;
		}

		const insight = buildImprovementInsight(record, relatedFindingTitle);
		const explanation = await generateImprovementExplanation(insight);

		return { ok: true, explanation };
	} catch (error) {
		if (error instanceof AiUnavailableError) {
			return { ok: false, error: error.message };
		}

		console.error('[ai] unexpected error generating improvement explanation:', error);
		return { ok: false, error: 'Something went wrong explaining this improvement. Please try again.' };
	}
}

/**
 * Server Action behind "Explain" on a detected signal pattern (Phase 8E).
 * Takes only signal ids, the same defensive contract as
 * createFindingFromPatternAction -- the pattern's stats (recurrence, day
 * span) are recomputed here from the actual org-scoped rows, never trusted
 * from the client, before being handed to the AI. Signals -> deterministic
 * grouping -> candidate pattern -> AI explanation.
 */
export async function explainSignalPatternAction(
	signalIds: string[],
): Promise<ExplainSignalPatternResult> {
	try {
		const membership = await getCurrentMembership();
		if (!membership) {
			return { ok: false, error: "We couldn't verify your organization. Please try again." };
		}

		if (signalIds.length < MIN_RECURRENCE) {
			return { ok: false, error: 'Not enough signals to form a pattern.' };
		}

		const supabase = await createClient();

		const { data: rows, error: fetchError } = await supabase
			.from('sentinel_signals')
			.select('*')
			.eq('organization_id', membership.organizationId)
			.in('id', signalIds)
			.is('finding_id', null);

		if (fetchError || !rows || rows.length < MIN_RECURRENCE) {
			return { ok: false, error: 'This pattern is no longer available.' };
		}

		const signals = rows.map(row => ({
			id: row.id,
			type: row.type as OperationalSignal['type'],
			source: row.source,
			sourceRef: row.source_ref,
			title: row.title,
			content: row.content,
			severity: row.severity as OperationalSignal['severity'],
			createdAt: row.created_at,
			findingId: row.finding_id,
		}));

		const pattern = buildPattern('manual', signals);
		const insight = buildSignalPatternInsight(pattern);
		const explanation = await generateSignalPatternExplanation(insight);

		return { ok: true, explanation };
	} catch (error) {
		if (error instanceof AiUnavailableError) {
			return { ok: false, error: error.message };
		}

		console.error('[ai] unexpected error explaining signal pattern:', error);
		return { ok: false, error: 'Something went wrong explaining this pattern. Please try again.' };
	}
}

/**
 * Server Action behind the AI Welcome Brief (Phase 10F), shown once a
 * brand-new org has signals but no report yet. Rebuilds the same
 * FirstInsightSummary the deterministic First Insight Card already shows
 * (getSignalsOverview -> buildFirstInsightSummary) rather than trusting
 * anything from the client, then hands only that summary to the AI.
 */
export async function generateWelcomeBriefAction(): Promise<GenerateWelcomeBriefResult> {
	try {
		const membership = await getCurrentMembership();
		if (!membership) {
			return { ok: false, error: "We couldn't find your organization's data." };
		}

		const overview = await getSignalsOverview();
		if (!overview) {
			return { ok: false, error: "We couldn't find your organization's data." };
		}

		const summary = buildFirstInsightSummary(overview.signals, overview.patterns);
		const insight = buildWelcomeInsight(summary);
		const brief = await generateWelcomeBrief(insight);

		return { ok: true, brief };
	} catch (error) {
		if (error instanceof AiUnavailableError) {
			return { ok: false, error: error.message };
		}

		console.error('[ai] unexpected error generating welcome brief:', error);
		return { ok: false, error: 'Something went wrong generating your welcome brief. Please try again.' };
	}
}

/**
 * Server Action behind the opt-in "Explain" button next to a deterministic
 * "Sentinel remembers..." note (Phase 12F). Takes only a candidate title
 * (an open finding's or a detected pattern's title, never a client-supplied
 * match) and rebuilds the org's improvement history itself before running
 * the same deterministic word-overlap match memory.ts already exposes --
 * the AI is only ever handed the single best match this function finds,
 * never the candidate title alone. Database facts -> deterministic memory
 * retrieval -> AI explanation.
 */
export async function explainHistoricalMatchAction(
	candidateTitle: string,
): Promise<ExplainHistoricalMatchResult> {
	try {
		const membership = await getCurrentMembership();
		if (!membership) {
			return { ok: false, error: "We couldn't find your organization's data." };
		}

		const metrics = await getExecutiveDashboardData();
		if (!metrics) {
			return { ok: false, error: "We couldn't find your organization's data." };
		}

		const matches = findSimilarPastResolutions(candidateTitle, metrics.improvementEvents);
		if (matches.length === 0) {
			return { ok: false, error: 'No similar resolved history found for this issue yet.' };
		}

		const insight = buildHistoricalInsight(candidateTitle, matches[0]);
		const advice = await generateHistoricalAdvice(insight);

		return { ok: true, advice };
	} catch (error) {
		if (error instanceof AiUnavailableError) {
			return { ok: false, error: error.message };
		}

		console.error('[ai] unexpected error explaining historical match:', error);
		return { ok: false, error: 'Something went wrong retrieving this history. Please try again.' };
	}
}
