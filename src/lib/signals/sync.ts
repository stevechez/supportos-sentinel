import type { createClient } from '@supportos/auth/server';

import { deriveConversationSignals, type ConversationMessage, type ConversationTicket } from './adapters/conversations';
import { deriveSupportOsSignals, type SupportOsTicket } from './adapters/supportos';
import { upsertConnectionSynced } from './connections';
import { ingestSignalBatch, SignalIngestError } from './ingest';
import type { OperationalSignal } from './types';

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export class SignalSyncError extends Error {
	constructor(message: string, cause?: unknown) {
		super(message);
		this.name = 'SignalSyncError';
		if (cause !== undefined) {
			this.cause = cause;
		}
	}
}

/** How many recent tickets a single sync looks at. A bounded window, not a full-table export -- this is a bridge, not a replication pipeline. */
const TICKET_SYNC_LIMIT = 200;

/**
 * Phase 9B, extended in Phase 10A and Phase 11: pulls this organization's
 * recent SupportOS tickets (and, as of Phase 11, their message threads),
 * runs them through both deterministic adapters, and upserts the
 * resulting signals -- then stamps the sentinel_connections row so
 * "Connected Sources" reflects the sync. One connection, one sync, two
 * adapters looking at the same data from different angles: ticket
 * metadata (Phase 9B) and conversation transcripts (Phase 11D). This one
 * function serves "Connect SupportOS" (Phase 10C) and every later "Sync
 * Now" -- there's no separate connect step, and no separate "sync chat"
 * button, per the Phase 11 principle that Chat Agent is a channel into
 * SupportOS, not a separate system to wire up on its own.
 */
export async function syncSupportOsSignals(
	supabase: SupabaseClient,
	organizationId: string,
): Promise<{ newSignals: OperationalSignal[] }> {
	const { data: tickets, error: fetchError } = await supabase
		.from('tickets')
		.select('id, subject, status, priority, sentiment, intent, tags, ai_resolved, created_at')
		.eq('organization_id', organizationId)
		.order('created_at', { ascending: false })
		.limit(TICKET_SYNC_LIMIT);

	if (fetchError) {
		throw new SignalSyncError('Could not read tickets from SupportOS.', fetchError);
	}

	const ticketRows = tickets ?? [];
	const ticketIds = ticketRows.map(row => row.id);

	const { data: messages, error: messagesError } =
		ticketIds.length === 0
			? { data: [] as { ticket_id: string; sender: string; created_at: string }[], error: null }
			: await supabase
					.from('messages')
					.select('ticket_id, sender, created_at')
					.eq('organization_id', organizationId)
					.in('ticket_id', ticketIds);

	if (messagesError) {
		throw new SignalSyncError('Could not read conversation messages from SupportOS.', messagesError);
	}

	const messagesByTicket = new Map<string, ConversationMessage[]>();
	for (const row of messages ?? []) {
		const list = messagesByTicket.get(row.ticket_id) ?? [];
		list.push({ sender: row.sender, createdAt: row.created_at });
		messagesByTicket.set(row.ticket_id, list);
	}

	const supportOsTickets: SupportOsTicket[] = ticketRows.map(row => ({
		id: row.id,
		subject: row.subject,
		status: row.status,
		priority: row.priority,
		sentiment: row.sentiment,
		intent: row.intent,
		tags: row.tags ?? [],
		aiResolved: row.ai_resolved,
		createdAt: row.created_at,
	}));

	const conversationTickets: ConversationTicket[] = ticketRows.map(row => ({
		id: row.id,
		subject: row.subject,
		status: row.status,
		aiResolved: row.ai_resolved,
	}));

	const rawSignals = [
		...deriveSupportOsSignals(supportOsTickets),
		...deriveConversationSignals(conversationTickets, messagesByTicket),
	];

	try {
		const newSignals = await ingestSignalBatch(supabase, organizationId, rawSignals);
		await upsertConnectionSynced(supabase, organizationId, 'supportos');
		return { newSignals };
	} catch (error) {
		if (error instanceof SignalIngestError) {
			throw new SignalSyncError(error.message, error.cause);
		}
		throw error;
	}
}
