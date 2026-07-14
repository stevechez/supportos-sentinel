'use server';

import { createClient } from '@supportos/auth/server';

import { getCurrentMembership, getExecutiveDashboardData } from '@/lib/dashboard/dashboard';

import {
	buildImprovementInsight,
	buildSentinelInsight,
	generateExecutiveBrief,
	generateImprovementExplanation,
} from './analyst';
import { AiUnavailableError, type ExecutiveBrief, type ImprovementExplanation } from './types';

export type GenerateExecutiveBriefResult =
	| { ok: true; brief: ExecutiveBrief }
	| { ok: false; error: string };

export type GenerateImprovementExplanationResult =
	| { ok: true; explanation: ImprovementExplanation }
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
