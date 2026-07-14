'use server';

import { getExecutiveDashboardData } from '@/lib/dashboard/dashboard';

import { buildSentinelInsight, generateExecutiveBrief } from './analyst';
import { AiUnavailableError, type ExecutiveBrief } from './types';

export type GenerateExecutiveBriefResult =
	| { ok: true; brief: ExecutiveBrief }
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
