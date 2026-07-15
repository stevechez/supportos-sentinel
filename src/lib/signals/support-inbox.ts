import { createClient } from '@supportos/auth/server';

import { getCurrentMembership } from '@/lib/dashboard/dashboard';

import { getSignalsOverview, getResolutionOverview } from './data';
import type { FrequentQuestion, ResolutionMetrics } from './resolution';
import type { SignalPattern } from './patterns';

// Phase 21D -- the Support Operations surface.
//
// Per the Phase 21A audit, "SupportOS" has no UI of its own today: a user
// only ever sees Sentinel's derived output (signals, findings), never the
// raw operational picture Sentinel is drawing conclusions from. This file
// is a narrow, read-only view over that same `tickets` data -- open
// conversations, pending escalations, recurring issues -- reusing
// getResolutionOverview() (Phase 15C) and getSignalsOverview()'s pattern
// detection (Phase 8D) rather than inventing new queries or a new schema.

export interface OpenTicketSummary {
	id: string;
	subject: string;
	status: string;
	isEscalated: boolean;
	createdAt: string;
}

export interface SupportInboxOverview {
	openTickets: OpenTicketSummary[];
	pendingEscalations: OpenTicketSummary[];
	frequentQuestions: FrequentQuestion[];
	recurringIssues: SignalPattern[];
	resolution: ResolutionMetrics;
}

const OPEN_TICKET_LIMIT = 50;

export async function getSupportInboxOverview(): Promise<SupportInboxOverview | null> {
	const membership = await getCurrentMembership();
	if (!membership) {
		return null;
	}

	const supabase = await createClient();

	const [{ data: tickets, error }, resolutionOverview, signalsOverview] = await Promise.all([
		supabase
			.from('tickets')
			.select('id, subject, status, decision_path, assignee_id, created_at')
			.eq('organization_id', membership.organizationId)
			.in('status', ['open', 'waiting'])
			.order('created_at', { ascending: false })
			.limit(OPEN_TICKET_LIMIT),
		getResolutionOverview(),
		getSignalsOverview(),
	]);

	if (error) {
		console.error('[support-inbox] fetching open tickets:', error);
	}

	const openTickets: OpenTicketSummary[] = (tickets ?? []).map(row => ({
		id: row.id,
		subject: row.subject,
		status: row.status,
		isEscalated: row.decision_path === 'escalated' || row.assignee_id !== null,
		createdAt: row.created_at,
	}));

	// Recurring issues: patterns Sentinel has already detected (Phase 8D)
	// that come from conversation/ticket signals specifically -- the same
	// deterministic clustering the rest of the product uses, just filtered
	// to what belongs on an operations view rather than every pattern type.
	const recurringIssues = (signalsOverview?.patterns ?? []).filter(
		pattern => pattern.type === 'conversation' || pattern.type === 'ticket',
	);

	return {
		openTickets,
		pendingEscalations: openTickets.filter(ticket => ticket.isEscalated),
		frequentQuestions: resolutionOverview?.frequentQuestions ?? [],
		recurringIssues,
		resolution: resolutionOverview?.metrics ?? {
			totalTickets: 0,
			aiResolvedCount: 0,
			aiResolutionRate: null,
			humanEscalatedCount: 0,
			knowledgeReuseCount: 0,
		},
	};
}
