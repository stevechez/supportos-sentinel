// The Operational Signal model (Phase 8A).
//
// Sentinel's own concept for "a piece of operational information came in,"
// deliberately not shaped after any vendor's data model (no "ZendeskTicket,"
// no "IntercomConversation"). Every ingestion path -- manual entry today,
// CSV import or a real integration later -- normalizes into this same
// shape. Sentinel's analysis engine never has to know where a signal came
// from, only what it says.

export type SignalType =
	| 'ticket'
	| 'conversation'
	| 'knowledge_gap'
	| 'customer_feedback'
	| 'metric'
	| 'ticket_volume';

export const SIGNAL_TYPES: SignalType[] = [
	'ticket',
	'conversation',
	'knowledge_gap',
	'customer_feedback',
	'metric',
	'ticket_volume',
];

export const SIGNAL_TYPE_LABELS: Record<SignalType, string> = {
	ticket: 'Ticket',
	conversation: 'Conversation',
	knowledge_gap: 'Knowledge Gap',
	customer_feedback: 'Customer Feedback',
	metric: 'Metric',
	// Phase 9C: an aggregate insight over several tickets ("Increase in
	// password reset tickets"), not a single ticket event. This is a new
	// *type value* on the existing signals table, not a new table or a
	// bespoke detector -- it flows through the same normalize/ingest/
	// pattern-detection path as every other signal type.
	ticket_volume: 'Ticket Volume',
};

export type SignalSeverity = 'critical' | 'high' | 'medium' | 'low';

/** The normalized shape every signal is stored and read as, regardless of source. */
export interface OperationalSignal {
	id: string;
	type: SignalType;
	source: string;
	/** Phase 9A: a connector's stable reference for this signal (e.g. "ticket:<id>"), used to upsert idempotently. Null for manual entry. */
	sourceRef: string | null;
	title: string;
	content: string | null;
	severity: SignalSeverity | null;
	createdAt: string;
	/** Set once this signal contributed to a real finding (Phase 8D). */
	findingId: string | null;
}

/**
 * Loosely-typed input from any ingestion path -- a manual entry form
 * today, a CSV row or a webhook payload later. normalize.ts is the only
 * place that turns this into a trustworthy NormalizedSignalInput.
 */
export interface RawSignalInput {
	type: string;
	source?: string;
	sourceRef?: string | null;
	title: string;
	content?: string | null;
	severity?: string | null;
}

/** The validated, ready-to-insert shape normalize.ts produces. */
export interface NormalizedSignalInput {
	type: SignalType;
	source: string;
	sourceRef: string | null;
	title: string;
	content: string | null;
	severity: SignalSeverity | null;
}

export class SignalValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'SignalValidationError';
	}
}
