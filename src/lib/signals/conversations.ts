import type { SignalPattern } from './patterns';
import type { OperationalSignal } from './types';

// Phase 11F: the deterministic "Customer Conversations" card summary.
// Pure -- reuses the same signals/patterns every other card reads
// (getSignalsOverview), just filtered down to what the Phase 11D
// conversation adapter produced. Deliberately no score, no percentage --
// "AI Performance Score: 83%" is explicitly out of scope for this phase.

export interface ConversationSummary {
	conversationsAnalyzed: number;
	recurringQuestionsDetected: number;
	knowledgeGapsDiscovered: number;
}

export function buildConversationSummary(
	signals: OperationalSignal[],
	patterns: SignalPattern[],
): ConversationSummary {
	return {
		conversationsAnalyzed: signals.filter(
			signal => signal.type === 'conversation' && signal.source === 'supportos',
		).length,
		recurringQuestionsDetected: patterns.filter(pattern => pattern.type === 'conversation').length,
		knowledgeGapsDiscovered: signals.filter(
			signal => signal.type === 'knowledge_gap' && signal.source === 'supportos',
		).length,
	};
}
