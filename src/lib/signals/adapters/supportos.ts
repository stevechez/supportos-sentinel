import type { RawSignalInput, SignalSeverity } from '../types';

// ---------------------------------------------------------------------------
// Phase 9B -- the SupportOS -> Sentinel bridge.
//
//   SupportOS ticket table (real operational data, Connect/Support-owned)
//         -> deriveSupportOsSignals() (pure, deterministic)
//         -> OperationalSignal candidates
//         -> ingestSignalBatch() (Phase 9A, upserts on source_ref)
//
// This is Sentinel's own ecosystem feeding itself, per the Phase 9 mission:
// SupportOS is the highest-value source of operational truth available,
// ahead of any third-party connector. Nothing here is AI -- every signal
// this produces is a rule over columns SupportOS already has (status,
// priority, tags, ai_resolved). "System detects. AI explains" is enforced
// by construction: this file only ever returns signals, never an
// explanation or a finding.
//
// Deliberately small, per the handoff's "start small, do not mirror an
// entire support system": three rules, not a general-purpose ticket
// classifier.
// ---------------------------------------------------------------------------

/** The subset of the `tickets` table this adapter actually reads. Kept narrow on purpose -- it should be obvious at a glance what SupportOS data Sentinel looks at. */
export interface SupportOsTicket {
	id: string;
	subject: string;
	status: string;
	priority: string;
	sentiment: string | null;
	intent: string | null;
	tags: string[];
	aiResolved: boolean;
	createdAt: string;
}

/** A tag group needs at least this many tickets before it's worth an aggregate "increase" signal. Below this, one or two tickets sharing a tag is normal noise, not a trend. */
const MIN_VOLUME_FOR_AGGREGATE = 2;

const PRIORITY_TO_SEVERITY: Record<string, SignalSeverity> = {
	urgent: 'critical',
	high: 'high',
	medium: 'medium',
	low: 'low',
};

function ticketSeverity(ticket: SupportOsTicket): SignalSeverity {
	return PRIORITY_TO_SEVERITY[ticket.priority] ?? 'medium';
}

/**
 * One signal per ticket: SupportOS created a ticket, Sentinel notices it
 * happened. This is the raw event -- title is the ticket's own subject, so
 * tickets sharing a subject line naturally cluster once Phase 8's
 * deterministic pattern detector (exact type + title match) sees three or
 * more of them, with no extra clustering logic needed here.
 */
function ticketCreatedSignal(ticket: SupportOsTicket): RawSignalInput {
	const parts = [`Priority: ${ticket.priority}`];
	if (ticket.sentiment) {
		parts.push(`Sentiment: ${ticket.sentiment}`);
	}
	if (ticket.intent) {
		parts.push(`Intent: ${ticket.intent}`);
	}

	return {
		type: 'ticket',
		source: 'supportos',
		sourceRef: `ticket:${ticket.id}`,
		title: ticket.subject,
		content: parts.join(' · '),
		severity: ticketSeverity(ticket),
	};
}

/**
 * A ticket that needed a human and couldn't be matched to an intent is a
 * simple, deterministic proxy for "self-service didn't have an answer for
 * this" -- worth a knowledge_gap signal. Not a guess about content; just a
 * rule over two columns SupportOS already tracks.
 */
function knowledgeGapSignal(ticket: SupportOsTicket): RawSignalInput | null {
	if (ticket.aiResolved || ticket.intent !== null) {
		return null;
	}

	return {
		type: 'knowledge_gap',
		source: 'supportos',
		sourceRef: `kb_gap:${ticket.id}`,
		title: `Missing documentation: ${ticket.subject}`,
		content: 'This ticket needed a human agent and matched no known self-service intent.',
		severity: ticketSeverity(ticket),
	};
}

/**
 * One aggregate signal per tag with enough tickets to be a real trend
 * ("Increase in shipping tickets"), computed over the tickets in this sync
 * batch. Deduped by tag alone (source_ref = ticket_volume:<tag>), so this
 * is created once and left alone on later syncs -- it's a snapshot
 * observation, not something that needs to keep restating itself.
 */
function ticketVolumeSignals(tickets: SupportOsTicket[]): RawSignalInput[] {
	const byTag = new Map<string, SupportOsTicket[]>();

	for (const ticket of tickets) {
		const tag = ticket.tags[0];
		if (!tag) {
			continue;
		}
		const group = byTag.get(tag) ?? [];
		group.push(ticket);
		byTag.set(tag, group);
	}

	const signals: RawSignalInput[] = [];
	for (const [tag, group] of byTag) {
		if (group.length < MIN_VOLUME_FOR_AGGREGATE) {
			continue;
		}
		signals.push({
			type: 'ticket_volume',
			source: 'supportos',
			sourceRef: `ticket_volume:${tag}`,
			title: `Increase in ${tag} tickets`,
			content: `${group.length} tickets tagged "${tag}" in the current sync window.`,
			severity: group.length >= 5 ? 'high' : 'medium',
		});
	}

	return signals;
}

/**
 * Pure and deterministic: given a batch of SupportOS tickets, returns every
 * OperationalSignal candidate they produce. No network access, no
 * database, no AI -- this is unit-testable on plain objects, and the only
 * thing sync.ts does with the result is hand it to ingestSignalBatch().
 */
export function deriveSupportOsSignals(tickets: SupportOsTicket[]): RawSignalInput[] {
	const signals: RawSignalInput[] = [];

	for (const ticket of tickets) {
		signals.push(ticketCreatedSignal(ticket));

		const gap = knowledgeGapSignal(ticket);
		if (gap) {
			signals.push(gap);
		}
	}

	signals.push(...ticketVolumeSignals(tickets));

	return signals;
}
