// Phase 15C/15D -- the resolution loop.
//
// Audit finding (Phase 15, documented in full in the commit message): this
// repository has no separate "Chat Agent" application to connect to
// SupportOS -- Chat Agent conversations already land as ordinary
// `tickets` + `messages` rows (see src/lib/signals/sync.ts's comment:
// "Chat Agent is a channel into SupportOS, not a separate system"). The
// `tickets` table already carries real resolution-outcome columns
// (ai_resolved, decision_path, decision_confidence, assignee_id) that
// nothing in Sentinel has ever read except `ai_resolved`, and only to
// shape a signal's severity -- never counted or shown on its own. This
// file is the missing link: it turns columns that already exist into the
// operational metrics Workstream 15D asks for. No new tables, no new AI,
// no new ingestion path.
//
// Entirely deterministic -- same discipline as every other file under
// src/lib/signals/. These are counts of what already happened, not a
// benchmark or a score.

export interface ResolutionTicket {
	id: string;
	subject: string;
	status: string;
	aiResolved: boolean;
	/** 'auto' | 'cited' | 'escalated' | null -- how the AI reached (or didn't reach) a resolution. Null means no automated decision was ever attempted (e.g. an old ticket, or one a human picked up directly). */
	decisionPath: string | null;
	assigneeId: string | null;
}

export interface ResolutionMetrics {
	totalTickets: number;
	aiResolvedCount: number;
	/** Percentage of all tickets Sentinel's data shows the AI resolved without a human, 0-100, null when there are no tickets to measure. */
	aiResolutionRate: number | null;
	/** Handed to a human -- either explicitly routed (decision_path = 'escalated') or directly assigned. */
	humanEscalatedCount: number;
	/** decision_path = 'cited' -- the AI answered by referencing an existing knowledge document, the concrete signal that a knowledge article was reused rather than written from scratch. */
	knowledgeReuseCount: number;
}

export function buildResolutionMetrics(tickets: ResolutionTicket[]): ResolutionMetrics {
	const totalTickets = tickets.length;
	const aiResolvedCount = tickets.filter(ticket => ticket.aiResolved).length;
	const humanEscalatedCount = tickets.filter(
		ticket => ticket.decisionPath === 'escalated' || ticket.assigneeId !== null,
	).length;
	const knowledgeReuseCount = tickets.filter(ticket => ticket.decisionPath === 'cited').length;

	return {
		totalTickets,
		aiResolvedCount,
		aiResolutionRate: totalTickets > 0 ? Math.round((aiResolvedCount / totalTickets) * 100) : null,
		humanEscalatedCount,
		knowledgeReuseCount,
	};
}

export interface FrequentQuestion {
	subject: string;
	count: number;
}

const MAX_FREQUENT_QUESTIONS = 5;
/** Below this, a repeated subject is one-off traffic, not a "frequently asked question" worth naming. */
const MIN_QUESTION_OCCURRENCES = 2;

function normalizeSubject(subject: string): string {
	return subject.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
}

/**
 * Groups tickets by exact normalized subject -- same simple, explainable
 * approach Phase 8's original pattern detection used, deliberately not the
 * fuzzy word-overlap clustering trends.ts uses for emerging risks. A
 * "Frequently Asked Question" list is meant to show a customer their own
 * ticket subjects verbatim, not a paraphrased theme.
 */
export function buildFrequentQuestions(tickets: ResolutionTicket[]): FrequentQuestion[] {
	const counts = new Map<string, { subject: string; count: number }>();

	for (const ticket of tickets) {
		const key = normalizeSubject(ticket.subject);
		if (!key) {
			continue;
		}
		const existing = counts.get(key);
		if (existing) {
			existing.count += 1;
		} else {
			counts.set(key, { subject: ticket.subject, count: 1 });
		}
	}

	return [...counts.values()]
		.filter(entry => entry.count >= MIN_QUESTION_OCCURRENCES)
		.sort((a, b) => b.count - a.count)
		.slice(0, MAX_FREQUENT_QUESTIONS);
}
