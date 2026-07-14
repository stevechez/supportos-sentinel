import type { RawSignalInput, SignalSeverity } from '../types';

// ---------------------------------------------------------------------------
// Phase 11D/E -- the Chat Agent -> SupportOS -> Sentinel bridge.
//
//   Customer -> Chat Agent -> ticket + messages (SupportOS owns this,
//   Phase 11A confirmed no new table is needed -- see note below)
//         -> deriveConversationSignals() (pure, deterministic)
//         -> OperationalSignal candidates
//         -> ingestSignalBatch() (Phase 9A, upserts on source_ref)
//
// Phase 11A audit finding: SupportOS already has a full conversation
// model. `tickets` already is "Conversation" (organization_id,
// customer_id, status, channel-as-source, created_at) and `messages`
// already is "Message" (ticket_id-as-conversation_id, a `sender` enum of
// customer/agent/ai/system -- exactly the customer/assistant/agent/system
// roles the Phase 11B handoff asked for). No sentinel_conversations, no
// sentinel_messages, no new conversations table at all -- Sentinel
// consumes SupportOS's existing model through an adapter, it doesn't own
// a parallel one.
//
// This adapter is deliberately distinct from src/lib/signals/adapters/
// supportos.ts (Phase 9B), which only ever looked at ticket *metadata*
// (status, priority, tags). This one is the first thing in Sentinel that
// reads the actual conversation transcript -- what the AI/agent said, and
// whether a human had to take over.
// ---------------------------------------------------------------------------

/** The subset of `tickets` this adapter reads. */
export interface ConversationTicket {
	id: string;
	subject: string;
	status: string;
	aiResolved: boolean;
}

/** The subset of `messages` this adapter reads, for one ticket's thread. */
export interface ConversationMessage {
	sender: string;
	createdAt: string;
}

const PRIORITY_SEVERITY: SignalSeverity = 'medium';

/**
 * Escalation: the AI attempted a response (sender = 'ai') and a human
 * agent later spoke in the same thread. A simple, deterministic proxy for
 * "the AI couldn't actually handle this" -- no sentiment analysis, no AI
 * evaluation, just message order.
 */
function hasEscalation(messages: ConversationMessage[]): boolean {
	const sorted = [...messages].sort(
		(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
	);
	const firstAiIndex = sorted.findIndex(m => m.sender === 'ai');
	if (firstAiIndex === -1) {
		return false;
	}
	return sorted.slice(firstAiIndex + 1).some(m => m.sender === 'agent');
}

function escalationSignal(ticket: ConversationTicket): RawSignalInput {
	return {
		type: 'knowledge_gap',
		source: 'supportos',
		sourceRef: `escalation:${ticket.id}`,
		title: `AI escalation: ${ticket.subject}`,
		content: 'The AI attempted a response, but a human agent had to take over this conversation.',
		severity: PRIORITY_SEVERITY,
	};
}

/**
 * Unresolved: the conversation is still open or waiting, and the AI never
 * resolved it. Titled distinctly from Phase 9's bare-subject 'ticket'
 * signals (prefixed "Unresolved:") so the two adapters never collide on
 * the same signal, even though they both read the same tickets table.
 */
function unresolvedSignal(ticket: ConversationTicket): RawSignalInput | null {
	if (ticket.aiResolved || (ticket.status !== 'open' && ticket.status !== 'waiting')) {
		return null;
	}

	return {
		type: 'ticket',
		source: 'supportos',
		sourceRef: `unresolved:${ticket.id}`,
		title: `Unresolved: ${ticket.subject}`,
		content: 'This conversation is still open and was never resolved by the AI.',
		severity: PRIORITY_SEVERITY,
	};
}

/**
 * Repeated topic: one signal per conversation, typed 'conversation'
 * (distinct from Phase 9's 'ticket' type) so Phase 8's existing exact
 * type+title pattern detector can find conversations that keep recurring
 * under the same subject -- without ever touching or duplicating what the
 * ticket-metadata adapter already emits for the same ticket.
 */
function repeatedTopicSignal(ticket: ConversationTicket): RawSignalInput {
	return {
		type: 'conversation',
		source: 'supportos',
		sourceRef: `conversation:${ticket.id}`,
		title: ticket.subject,
		content: 'A customer conversation on this topic.',
		severity: PRIORITY_SEVERITY,
	};
}

/**
 * Pure and deterministic: given a batch of conversations (tickets) and
 * their message threads, returns every OperationalSignal candidate they
 * produce. No AI evaluation, no sentiment analysis, no conversation
 * scoring -- exactly the three rules the Phase 11E handoff scoped this
 * to, over data SupportOS already has.
 */
export function deriveConversationSignals(
	tickets: ConversationTicket[],
	messagesByTicket: Map<string, ConversationMessage[]>,
): RawSignalInput[] {
	const signals: RawSignalInput[] = [];

	for (const ticket of tickets) {
		signals.push(repeatedTopicSignal(ticket));

		const messages = messagesByTicket.get(ticket.id) ?? [];
		if (hasEscalation(messages)) {
			signals.push(escalationSignal(ticket));
		}

		const unresolved = unresolvedSignal(ticket);
		if (unresolved) {
			signals.push(unresolved);
		}
	}

	return signals;
}
