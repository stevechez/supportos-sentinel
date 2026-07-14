import { jaccardSimilarity, MIN_SIMILARITY, significantWords } from '../text-similarity';
import type { OperationalSignal, SignalType } from './types';

// ---------------------------------------------------------------------------
// Phase 14A -- the trend acceleration engine.
//
//   Signals -> weekly buckets -> theme clusters -> growth check -> EmergingTrend
//
// Entirely deterministic, no AI, no forecasting, no machine learning. This
// file only ever counts things that already happened and compares one
// period to another -- it never estimates what will happen next. Same
// "predict, don't speculate" discipline the handoff spells out: the output
// is always a fact about the recent past ("increasing faster than normal
// based on recent operational data"), never a claim about the future.
// ---------------------------------------------------------------------------

export const PERIOD_DAYS = 7;
export const PERIOD_COUNT = 3;

/** Below this period-over-period growth, an increase is noise, not a trend worth surfacing. */
export const GROWTH_THRESHOLD_PERCENT = 20;

export interface EmergingTrend {
	signalType: SignalType;
	/** Representative title -- the most common title in the cluster's most recent period. */
	title: string;
	/** Signal ids behind the current (most recent) period's count, for building an EmergingRisk's evidence. */
	currentPeriodSignalIds: string[];
	/** Oldest-to-newest per-period counts, always length PERIOD_COUNT (zero-filled for empty periods). */
	periodCounts: number[];
	previousCount: number;
	currentCount: number;
	/** Rounded percentage; null when previousCount is 0 (division is meaningless, not "infinite growth"). */
	growthPercentage: number | null;
	/** True only when every one of the last PERIOD_COUNT periods has at least one signal -- Rule 2, "repeated appearance." */
	consecutiveAppearance: boolean;
	confidence: 'low' | 'medium' | 'high';
}

/**
 * Clusters signals of the same type into operational themes using the same
 * deterministic word-overlap similarity Phase 12C already proved
 * (src/lib/text-similarity.ts) -- greedy single-pass clustering, not
 * embeddings. Each signal joins the first existing cluster whose
 * representative title is similar enough; otherwise it starts a new
 * cluster. This is what lets "customer forgot password," "password reset
 * link expired," and "password reset confusion" count as the same
 * emerging theme instead of three separate one-off signals that never
 * individually reach a meaningful count.
 */
function clusterByTheme(signals: OperationalSignal[]): Map<string, OperationalSignal[]> {
	const clusters = new Map<string, OperationalSignal[]>();
	const representativeWords = new Map<string, Set<string>>();

	for (const signal of signals) {
		const words = significantWords(signal.title);
		let matchedKey: string | null = null;

		for (const [key, repWords] of representativeWords) {
			if (jaccardSimilarity(words, repWords) >= MIN_SIMILARITY) {
				matchedKey = key;
				break;
			}
		}

		if (matchedKey) {
			clusters.get(matchedKey)!.push(signal);
		} else {
			const key = `${signal.type}::${signal.id}`;
			clusters.set(key, [signal]);
			representativeWords.set(key, words);
		}
	}

	return clusters;
}

/** Which of the last PERIOD_COUNT weekly buckets (0 = most recent) a timestamp falls into, or null if older. */
function periodIndex(createdAt: string, now: Date): number | null {
	const ageMs = now.getTime() - new Date(createdAt).getTime();
	const ageDays = ageMs / 86_400_000;
	if (ageDays < 0) {
		return 0;
	}
	const index = Math.floor(ageDays / PERIOD_DAYS);
	return index < PERIOD_COUNT ? index : null;
}

function mostCommonTitle(signals: OperationalSignal[]): string {
	const counts = new Map<string, number>();
	for (const signal of signals) {
		counts.set(signal.title, (counts.get(signal.title) ?? 0) + 1);
	}
	let best = signals[0].title;
	let bestCount = 0;
	for (const [title, count] of counts) {
		if (count > bestCount) {
			best = title;
			bestCount = count;
		}
	}
	return best;
}

/**
 * Detects emerging trends across an org's operational signals. Only
 * considers signals not yet attached to a finding (findingId === null) --
 * once something has already become a finding, it's tracked through the
 * existing lifecycle (Phase 7), not re-flagged as "emerging."
 *
 * Detection rules, all deterministic (Phase 14A):
 *   1. Increasing frequency: current period > previous period AND growth
 *      exceeds GROWTH_THRESHOLD_PERCENT.
 *   2. Repeated appearance: at least one signal in every one of the last
 *      three weekly periods.
 * A cluster only becomes an EmergingTrend when rule 1 holds. Rule 2 is
 * folded into the trend's confidence rather than gating it -- a real
 * 3-week acceleration that only just started two periods ago is still
 * worth surfacing, just with lower confidence than one with a full
 * three-period track record.
 */
export function detectEmergingTrends(signals: OperationalSignal[], now: Date = new Date()): EmergingTrend[] {
	const candidates = signals.filter(signal => !signal.findingId);
	const clusters = clusterByTheme(candidates);

	const trends: EmergingTrend[] = [];

	for (const cluster of clusters.values()) {
		const periodCounts = new Array<number>(PERIOD_COUNT).fill(0);
		const periodSignals: OperationalSignal[][] = Array.from({ length: PERIOD_COUNT }, () => []);

		for (const signal of cluster) {
			const index = periodIndex(signal.createdAt, now);
			if (index !== null) {
				periodCounts[index] += 1;
				periodSignals[index].push(signal);
			}
		}

		// periodCounts[0] is the most recent period; reverse to oldest-first for display.
		const oldestFirst = [...periodCounts].reverse();
		const currentCount = periodCounts[0];
		const previousCount = periodCounts[1];

		const growthPercentage = previousCount > 0
			? Math.round(((currentCount - previousCount) / previousCount) * 100)
			: null;

		const isIncreasing =
			currentCount > previousCount && growthPercentage !== null && growthPercentage > GROWTH_THRESHOLD_PERCENT;

		if (!isIncreasing) {
			continue;
		}

		const consecutiveAppearance = periodCounts.every(count => count > 0);

		const confidence: EmergingTrend['confidence'] = consecutiveAppearance && growthPercentage !== null && growthPercentage >= 50
			? 'high'
			: consecutiveAppearance || (growthPercentage !== null && growthPercentage >= 50)
				? 'medium'
				: 'low';

		trends.push({
			signalType: cluster[0].type,
			title: mostCommonTitle(periodSignals[0].length > 0 ? periodSignals[0] : cluster),
			currentPeriodSignalIds: periodSignals[0].map(signal => signal.id),
			periodCounts: oldestFirst,
			previousCount,
			currentCount,
			growthPercentage,
			consecutiveAppearance,
			confidence,
		});
	}

	return trends.sort((a, b) => (b.growthPercentage ?? 0) - (a.growthPercentage ?? 0));
}
