import type { SignalPattern } from './patterns';
import { SIGNAL_TYPE_LABELS } from './types';
import type { OperationalSignal } from './types';

// Phase 10D: the deterministic "first insight" summary. Pure -- no AI,
// no database access. Reuses exactly what Phase 8's pattern detector
// already computed (getSignalsOverview) rather than re-deriving anything,
// so this card can never disagree with the Operational Signals card lower
// on the page; it's the same numbers, framed for a first-time view.

export interface FirstInsightSummary {
	signalCount: number;
	recurringIssueCount: number;
	knowledgeGapCount: number;
	topPattern: SignalPattern | null;
}

export function buildFirstInsightSummary(
	signals: OperationalSignal[],
	patterns: SignalPattern[],
): FirstInsightSummary {
	return {
		signalCount: signals.length,
		recurringIssueCount: patterns.length,
		knowledgeGapCount: signals.filter(signal => signal.type === 'knowledge_gap').length,
		topPattern: patterns[0] ?? null,
	};
}

/**
 * A single templated sentence, not a model call -- "system detects, AI
 * explains" means the deterministic engine is allowed to *state* what it
 * found, it just isn't allowed to interpret it. The AI Welcome Brief
 * (Phase 10F) is the interpretation; this is the fact.
 */
export function firstInsightHeadline(summary: FirstInsightSummary): string {
	if (summary.topPattern) {
		const typeLabel = SIGNAL_TYPE_LABELS[summary.topPattern.type].toLowerCase();
		return `Customers are repeatedly reporting "${summary.topPattern.title}" (${summary.topPattern.recurrenceCount} ${typeLabel} signals). This may indicate a gap in self-service documentation.`;
	}
	if (summary.knowledgeGapCount > 0) {
		return `Sentinel found ${summary.knowledgeGapCount} signal${summary.knowledgeGapCount === 1 ? '' : 's'} suggesting documentation may be missing somewhere in your operation.`;
	}
	return 'Sentinel is watching your signals for recurring issues. Nothing stands out as a pattern yet.';
}
