import { createClient } from '@supportos/auth/server';

// Phase 21E -- the Sentinel connection layer.
//
// Per the handoff's worked example: a finding like "password-reset
// questions increased 300%" should be traceable back to where it came
// from and what to do about it. The "what to do" half already exists
// (Recommendation.title/impact, linked via findingId in dashboard.ts).
// This file builds the missing "where did this come from" half: every
// sentinel_signals row already carries a source_ref that -- for every
// SupportOS-sourced signal type except the tag-aggregate 'ticket_volume'
// type -- is `<prefix>:<ticket-uuid>` (see adapters/supportos.ts and
// adapters/conversations.ts). No new column, no new table: this just
// parses a value that was already being written and joins it back to the
// ticket it came from.

const TICKET_REF_PREFIXES = ['ticket', 'kb_gap', 'escalation', 'unresolved', 'conversation'];

function parseTicketId(sourceRef: string | null): string | null {
	if (!sourceRef) {
		return null;
	}
	const [prefix, id] = sourceRef.split(':');
	if (!id || !TICKET_REF_PREFIXES.includes(prefix)) {
		return null;
	}
	return id;
}

export interface FindingProvenance {
	signalCount: number;
	tickets: { id: string; subject: string }[];
}

/** Cap how many distinct source tickets are shown per finding -- provenance is meant to answer "where did this come from", not reproduce the full signal list. */
const MAX_TICKETS_PER_FINDING = 5;

/**
 * Batch-loads provenance for every finding id in one pass: which signals
 * fed each finding, and which real tickets those signals point back to.
 * Returns a Map keyed by finding id so callers can look up
 * "no provenance" (empty entry) vs "not in this map" (finding id wasn't
 * asked for) without ambiguity.
 */
export async function getFindingProvenance(
	organizationId: string,
	findingIds: string[],
): Promise<Map<string, FindingProvenance>> {
	const result = new Map<string, FindingProvenance>();
	if (findingIds.length === 0) {
		return result;
	}

	const supabase = await createClient();

	const { data: signals, error } = await supabase
		.from('sentinel_signals')
		.select('finding_id, source_ref')
		.eq('organization_id', organizationId)
		.in('finding_id', findingIds);

	if (error) {
		console.error('[provenance] fetching signals for findings:', error);
		return result;
	}

	const ticketIdsByFinding = new Map<string, Set<string>>();
	const signalCountByFinding = new Map<string, number>();

	for (const row of signals ?? []) {
		if (!row.finding_id) {
			continue;
		}
		signalCountByFinding.set(row.finding_id, (signalCountByFinding.get(row.finding_id) ?? 0) + 1);

		const ticketId = parseTicketId(row.source_ref);
		if (!ticketId) {
			continue;
		}
		const set = ticketIdsByFinding.get(row.finding_id) ?? new Set<string>();
		set.add(ticketId);
		ticketIdsByFinding.set(row.finding_id, set);
	}

	const allTicketIds = [...new Set([...ticketIdsByFinding.values()].flatMap(set => [...set]))];

	const ticketSubjects = new Map<string, string>();
	if (allTicketIds.length > 0) {
		const { data: tickets, error: ticketsError } = await supabase
			.from('tickets')
			.select('id, subject')
			.eq('organization_id', organizationId)
			.in('id', allTicketIds);

		if (ticketsError) {
			console.error('[provenance] fetching source tickets:', ticketsError);
		}

		for (const ticket of tickets ?? []) {
			ticketSubjects.set(ticket.id, ticket.subject);
		}
	}

	for (const findingId of findingIds) {
		const ticketIds = [...(ticketIdsByFinding.get(findingId) ?? new Set<string>())].slice(
			0,
			MAX_TICKETS_PER_FINDING,
		);

		result.set(findingId, {
			signalCount: signalCountByFinding.get(findingId) ?? 0,
			tickets: ticketIds
				.map(id => ({ id, subject: ticketSubjects.get(id) ?? 'Untitled conversation' }))
				.filter(ticket => ticketSubjects.has(ticket.id)),
		});
	}

	return result;
}
