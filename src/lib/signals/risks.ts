import type { ImprovementEvent, SimilarResolution } from '@/lib/dashboard/memory';
import { findSimilarPastResolutions } from '@/lib/dashboard/memory';

import { PERIOD_COUNT, PERIOD_DAYS, type EmergingTrend } from './trends';
import { SIGNAL_TYPE_LABELS } from './types';
import type { SignalType } from './types';

// ---------------------------------------------------------------------------
// Phase 14B -- the EmergingRisk derived model.
//
//   EmergingTrend (14A, purely counts) -> EmergingRisk (evidence + a
//   recommendation) -> Executive Risk Card (14C) / AI explanation (14E)
//
// Deliberately not a prediction system: an EmergingRisk never claims what
// will happen. It restates what already happened (the trend) as evidence,
// checks Phase 12's organizational memory for a prior similar resolution
// (14F), and derives a plain recommended next step from whichever of those
// two things is true. No AI runs here -- src/lib/ai/analyst.ts only ever
// explains an EmergingRisk this file already built.
// ---------------------------------------------------------------------------

export interface EmergingRisk {
	title: string;
	signalType: SignalType;
	evidence: string[];
	severity: 'low' | 'medium' | 'high';
	confidence: EmergingTrend['confidence'];
	recommendedAction: string;
	/** Oldest-to-newest per-period counts, for the trend timeline (14D). */
	periodCounts: number[];
	currentPeriodSignalIds: string[];
	/** Phase 14F: the most similar already-resolved issue, if Phase 12's memory layer finds one above its similarity threshold. */
	priorResolution: SimilarResolution['event'] | null;
}

function deriveSeverity(currentCount: number): EmergingRisk['severity'] {
	if (currentCount >= 10) {
		return 'high';
	}
	if (currentCount >= 5) {
		return 'medium';
	}
	return 'low';
}

function buildEvidence(trend: EmergingTrend, priorResolution: ImprovementEvent | null): string[] {
	const typeLabel = SIGNAL_TYPE_LABELS[trend.signalType].toLowerCase();
	const pluralType = trend.currentCount === 1 ? typeLabel : `${typeLabel}s`;

	const evidence = [`${trend.currentCount} ${pluralType} in the last ${PERIOD_DAYS} days`];

	if (trend.consecutiveAppearance) {
		evidence.push(`Increasing for ${PERIOD_COUNT} consecutive weeks`);
	}

	if (trend.growthPercentage !== null) {
		evidence.push(`${trend.growthPercentage}% increase from the previous week`);
	}

	if (priorResolution) {
		evidence.push(`A similar issue was resolved before: ${priorResolution.actionTaken}`);
	}

	return evidence;
}

function buildRecommendedAction(priorResolution: ImprovementEvent | null): string {
	if (priorResolution) {
		return `Sentinel recommends reviewing the previous resolution: ${priorResolution.actionTaken}.`;
	}
	return 'Review recent activity for this issue and consider proactive outreach or documentation updates.';
}

/**
 * Turns each detected trend into an EmergingRisk, checking Phase 12's
 * organizational memory (findSimilarPastResolutions) for each one -- "have
 * we seen this before?" is asked here, deterministically, exactly once per
 * trend. Sorted the same way trends already are (steepest growth first).
 */
export function buildEmergingRisks(
	trends: EmergingTrend[],
	improvementEvents: ImprovementEvent[],
): EmergingRisk[] {
	return trends.map(trend => {
		const matches = findSimilarPastResolutions(trend.title, improvementEvents);
		const priorResolution = matches[0]?.event ?? null;

		return {
			title: trend.title,
			signalType: trend.signalType,
			evidence: buildEvidence(trend, priorResolution),
			severity: deriveSeverity(trend.currentCount),
			confidence: trend.confidence,
			recommendedAction: buildRecommendedAction(priorResolution),
			periodCounts: trend.periodCounts,
			currentPeriodSignalIds: trend.currentPeriodSignalIds,
			priorResolution,
		};
	});
}
