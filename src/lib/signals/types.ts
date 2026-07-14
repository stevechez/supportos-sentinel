// The Operational Signal model (Phase 8A).
//
// Sentinel's own concept for "a piece of operational information came in,"
// deliberately not shaped after any vendor's data model (no "ZendeskTicket,"
// no "IntercomConversation"). Every ingestion path -- manual entry today,
// CSV import or a real integration later -- normalizes into this same
// shape. Sentinel's analysis engine never has to know where a signal came
// from, only what it says.

export type SignalType = 'ticket' | 'conversation' | 'knowledge_gap' | 'customer_feedback' | 'metric';

export const SIGNAL_TYPES: SignalType[] = [
	'ticket',
	'conversation',
	'knowledge_gap',
	'customer_feedback',
	'metric',
];

export const SIGNAL_TYPE_LABELS: Record<SignalType, string> = {
	ticket: 'Ticket',
	conversation: 'Conversation',
	knowledge_gap: 'Knowledge Gap',
	customer_feedback: 'Customer Feedback',
	metric: 'Metric',
};

export type SignalSeverity = 'critical' | 'high' | 'medium' | 'low';

/** The normalized shape every signal is stored and read as, regardless of source. */
export interface OperationalSignal {
	id: string;
	type: SignalType;
	source: string;
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
	title: string;
	content?: string | null;
	severity?: string | null;
}

/** The validated, ready-to-insert shape normalize.ts produces. */
export interface NormalizedSignalInput {
	type: SignalType;
	source: string;
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
