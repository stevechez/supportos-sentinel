import { createClient } from '@supportos/auth/server';

import { getCurrentMembership } from '@/lib/dashboard/dashboard';

// Phase 21C -- the Conversations surface.
//
// Per the Phase 21A audit: `tickets` + `messages` already are this app's
// real conversation data (Chat Agent is a channel into SupportOS, not a
// separate system -- see src/lib/signals/sync.ts). Nothing here reads a
// new table. This file gives that existing data its first per-conversation
// (rather than aggregate) view, reusing the exact same "AI attempted a
// response, then a human took over" escalation rule the Phase 11D
// conversation adapter already established in
// src/lib/signals/adapters/conversations.ts -- kept in sync deliberately,
// not re-derived differently here.
//
// Deliberately narrow, per the handoff: a recent-conversations list with a
// status, not a full inbox, not a reply composer, not real-time updates.

export type ConversationOutcome = 'ai_handled' | 'escalated' | 'unresolved' | 'resolved';

export interface ConversationListItem {
	/** The ticket id. Deliberately also serves as "the linked ticket" -- in this schema a conversation and its ticket are the same row (see docs/architecture/platform-audit.md), so there's no separate id to link to. */
	id: string;
	subject: string;
	status: string;
	outcome: ConversationOutcome;
	customerName: string | null;
	messageCount: number;
	lastMessageAt: string | null;
	lastMessagePreview: string | null;
	createdAt: string;
}

/** Bounded window -- same discipline as sync.ts and resolution.ts. This is a recent-activity view, not an export. */
const CONVERSATION_LIST_LIMIT = 50;

function hasEscalation(messages: { sender: string; createdAt: string }[]): boolean {
	const sorted = [...messages].sort(
		(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
	);
	const firstAiIndex = sorted.findIndex(m => m.sender === 'ai');
	if (firstAiIndex === -1) {
		return false;
	}
	return sorted.slice(firstAiIndex + 1).some(m => m.sender === 'agent');
}

function classifyOutcome(
	ticket: { status: string; aiResolved: boolean },
	messages: { sender: string; createdAt: string }[],
): ConversationOutcome {
	if (hasEscalation(messages)) {
		return 'escalated';
	}
	if (ticket.aiResolved) {
		return 'ai_handled';
	}
	if (ticket.status === 'open' || ticket.status === 'waiting') {
		return 'unresolved';
	}
	return 'resolved';
}

export async function getRecentConversations(): Promise<ConversationListItem[] | null> {
	const membership = await getCurrentMembership();
	if (!membership) {
		return null;
	}

	const supabase = await createClient();

	const { data: tickets, error: ticketsError } = await supabase
		.from('tickets')
		.select('id, subject, status, ai_resolved, customer_id, created_at')
		.eq('organization_id', membership.organizationId)
		.order('created_at', { ascending: false })
		.limit(CONVERSATION_LIST_LIMIT);

	if (ticketsError) {
		console.error('[conversations] fetching tickets:', ticketsError);
		return [];
	}

	const ticketRows = tickets ?? [];
	const ticketIds = ticketRows.map(row => row.id);
	const customerIds = [...new Set(ticketRows.map(row => row.customer_id).filter((id): id is string => Boolean(id)))];

	const [{ data: messages, error: messagesError }, { data: customers, error: customersError }] = await Promise.all([
		ticketIds.length === 0
			? Promise.resolve({ data: [] as { ticket_id: string; sender: string; body: string | null; created_at: string }[], error: null })
			: supabase
					.from('messages')
					.select('ticket_id, sender, body, created_at')
					.eq('organization_id', membership.organizationId)
					.in('ticket_id', ticketIds),
		customerIds.length === 0
			? Promise.resolve({ data: [] as { id: string; name: string | null }[], error: null })
			: supabase
					.from('customers')
					.select('id, name')
					.eq('organization_id', membership.organizationId)
					.in('id', customerIds),
	]);

	if (messagesError) {
		console.error('[conversations] fetching messages:', messagesError);
	}
	if (customersError) {
		console.error('[conversations] fetching customers:', customersError);
	}

	const messagesByTicket = new Map<string, { sender: string; body: string | null; createdAt: string }[]>();
	for (const row of messages ?? []) {
		const list = messagesByTicket.get(row.ticket_id) ?? [];
		list.push({ sender: row.sender, body: row.body, createdAt: row.created_at });
		messagesByTicket.set(row.ticket_id, list);
	}

	const nameByCustomer = new Map((customers ?? []).map(row => [row.id, row.name]));

	return ticketRows.map(row => {
		const threadMessages = messagesByTicket.get(row.id) ?? [];
		const sorted = [...threadMessages].sort(
			(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
		);
		const lastMessage = sorted[sorted.length - 1] ?? null;

		return {
			id: row.id,
			subject: row.subject,
			status: row.status,
			outcome: classifyOutcome({ status: row.status, aiResolved: row.ai_resolved }, threadMessages),
			customerName: row.customer_id ? (nameByCustomer.get(row.customer_id) ?? null) : null,
			messageCount: threadMessages.length,
			lastMessageAt: lastMessage?.createdAt ?? null,
			lastMessagePreview: lastMessage?.body ?? null,
			createdAt: row.created_at,
		};
	});
}

export const CONVERSATION_OUTCOME_LABELS: Record<ConversationOutcome, string> = {
	ai_handled: 'Handled by AI',
	escalated: 'Escalated to human',
	unresolved: 'Unresolved',
	resolved: 'Resolved by human',
};
