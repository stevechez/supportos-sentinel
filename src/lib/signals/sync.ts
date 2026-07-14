import type { createClient } from '@supportos/auth/server';

import { deriveSupportOsSignals, type SupportOsTicket } from './adapters/supportos';
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
 * Phase 9B: pulls this organization's recent SupportOS tickets, runs them
 * through the deterministic adapter, and upserts the resulting signals.
 * Manually triggered by the "Sync Now" button (Phase 9D) -- the handoff is
 * explicit that real-time streaming infrastructure is out of scope for
 * this phase, so this is a pull, not a webhook.
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

	const supportOsTickets: SupportOsTicket[] = (tickets ?? []).map(row => ({
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

	const rawSignals = deriveSupportOsSignals(supportOsTickets);

	try {
		const newSignals = await ingestSignalBatch(supabase, organizationId, rawSignals);
		return { newSignals };
	} catch (error) {
		if (error instanceof SignalIngestError) {
			throw new SignalSyncError(error.message, error.cause);
		}
		throw error;
	}
}
