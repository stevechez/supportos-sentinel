import { createAdminClient } from '@supportos/auth/admin';

import type { FeedbackDecision, FeedbackPriority, FeedbackStatus, FeedbackType } from '@/lib/feedback/types';

export const PILOT_STATUSES = ['invited', 'onboarding', 'active', 'reviewing', 'converted', 'paused'] as const;
export type PilotStatus = (typeof PILOT_STATUSES)[number];

export const PILOT_STATUS_LABELS: Record<PilotStatus, string> = {
	invited: 'Invited',
	onboarding: 'Onboarding',
	active: 'Active',
	reviewing: 'Reviewing',
	converted: 'Converted',
	paused: 'Paused',
};

export interface FounderPilotRow {
	organizationId: string;
	organizationName: string;
	signupDate: string;
	pilotStatus: PilotStatus;
	pilotStartedAt: string | null;
	primaryContactName: string | null;
	primaryContactEmail: string | null;
	memberCount: number;
	connectedSource: boolean;
	baselineCreated: boolean;
	/** Phase 20C -- when the org's first health report was created, i.e. "time to value" measured against signupDate. Null until they've reached it. */
	firstInsightAt: string | null;
	/** Phase 20I -- total health reports generated, a simple proxy for "insights generated." */
	insightsGenerated: number;
	lastActivityAt: string | null;
	feedbackCount: number;
	openFeedbackCount: number;
}

export interface FounderSummary {
	totalOrganizations: number;
	activePilots: number;
	activatedCount: number;
	activationRate: number;
	/** Average days from signup to first insight, across organizations that have activated. Null if none have yet. */
	averageTimeToValueDays: number | null;
	/** Signed up, never connected a source. */
	dropOffAtConnect: number;
	/** Connected a source, never reached a first insight. */
	dropOffAtSync: number;
	totalInsightsGenerated: number;
	totalFeedback: number;
	openFeedback: number;
}

/**
 * Phase 19C/20B/20C/20I -- the founder dashboard's one query, extended
 * across three phases without ever becoming a separate analytics system:
 * still one Promise.all of narrow, purpose-built reads, still entirely
 * derived from tables that already exist for other reasons
 * (organizations, members, sentinel_connections, sentinel_reports,
 * activity_log, customer_feedback). Deliberately read-only from this
 * function's perspective -- mutations (pilot status, feedback decisions)
 * live in src/lib/founder/actions.ts as their own narrow, founder-gated
 * writes.
 */
export async function getFounderPilotOverview(): Promise<FounderPilotRow[]> {
	const supabase = createAdminClient();

	const [{ data: organizations }, { data: members }, { data: connections }, { data: reports }, { data: activity }, { data: feedback }] =
		await Promise.all([
			supabase
				.from('organizations')
				.select('id, name, created_at, pilot_status, pilot_started_at, primary_contact_name, primary_contact_email')
				.order('created_at', { ascending: false }),
			supabase.from('members').select('organization_id'),
			supabase.from('sentinel_connections').select('organization_id, status'),
			supabase.from('sentinel_reports').select('organization_id, created_at').order('created_at', { ascending: true }),
			supabase.from('activity_log').select('organization_id, created_at').order('created_at', { ascending: false }),
			supabase.from('customer_feedback').select('organization_id, status'),
		]);

	const memberCounts = countBy(members ?? [], row => row.organization_id);
	const hasConnection = new Set(
		(connections ?? []).filter(row => row.status === 'connected').map(row => row.organization_id),
	);
	const reportCounts = countBy(reports ?? [], row => row.organization_id);
	const firstReportAt = new Map<string, string>();
	for (const row of reports ?? []) {
		// Rows are ordered oldest-first, so the first one seen per
		// organization is its first-ever report -- the "first insight" date.
		// created_at is nullable in the schema (no non-null constraint), but
		// every report this app creates sets it -- skip the theoretical null
		// case rather than widening every downstream type to handle it.
		if (row.created_at && !firstReportAt.has(row.organization_id)) {
			firstReportAt.set(row.organization_id, row.created_at);
		}
	}
	const lastActivity = new Map<string, string>();
	for (const row of activity ?? []) {
		if (!lastActivity.has(row.organization_id)) {
			lastActivity.set(row.organization_id, row.created_at);
		}
	}
	const feedbackCounts = countBy(feedback ?? [], row => row.organization_id);
	const openFeedbackCounts = countBy(
		(feedback ?? []).filter(row => row.status === 'new'),
		row => row.organization_id,
	);

	return (organizations ?? []).map(org => ({
		organizationId: org.id,
		organizationName: org.name,
		signupDate: org.created_at,
		pilotStatus: isPilotStatus(org.pilot_status) ? org.pilot_status : 'invited',
		pilotStartedAt: org.pilot_started_at,
		primaryContactName: org.primary_contact_name,
		primaryContactEmail: org.primary_contact_email,
		memberCount: memberCounts.get(org.id) ?? 0,
		connectedSource: hasConnection.has(org.id),
		baselineCreated: (reportCounts.get(org.id) ?? 0) > 0,
		firstInsightAt: firstReportAt.get(org.id) ?? null,
		insightsGenerated: reportCounts.get(org.id) ?? 0,
		lastActivityAt: lastActivity.get(org.id) ?? null,
		feedbackCount: feedbackCounts.get(org.id) ?? 0,
		openFeedbackCount: openFeedbackCounts.get(org.id) ?? 0,
	}));
}

/**
 * Phase 20C/20I -- the pilot-review summary. Every number here is a
 * straightforward aggregation over rows getFounderPilotOverview() already
 * computed -- no second query, no new table. "Activation rate" and
 * "time to value" use the same activation definition documented in
 * docs/product/activation-funnel.md (Phase 18C): reaching a first health
 * report.
 */
export function summarizeFounderPilots(rows: FounderPilotRow[]): FounderSummary {
	const activated = rows.filter(row => row.baselineCreated && row.firstInsightAt);

	const timeToValueDays = activated.map(row => {
		const signup = new Date(row.signupDate).getTime();
		const insight = new Date(row.firstInsightAt as string).getTime();
		return Math.max(0, (insight - signup) / (1000 * 60 * 60 * 24));
	});

	const averageTimeToValueDays =
		timeToValueDays.length > 0 ? timeToValueDays.reduce((a, b) => a + b, 0) / timeToValueDays.length : null;

	return {
		totalOrganizations: rows.length,
		activePilots: rows.filter(row => row.pilotStatus === 'active').length,
		activatedCount: activated.length,
		activationRate: rows.length > 0 ? activated.length / rows.length : 0,
		averageTimeToValueDays,
		dropOffAtConnect: rows.filter(row => !row.connectedSource).length,
		dropOffAtSync: rows.filter(row => row.connectedSource && !row.baselineCreated).length,
		totalInsightsGenerated: rows.reduce((sum, row) => sum + row.insightsGenerated, 0),
		totalFeedback: rows.reduce((sum, row) => sum + row.feedbackCount, 0),
		openFeedback: rows.reduce((sum, row) => sum + row.openFeedbackCount, 0),
	};
}

export interface FounderFeedbackRow {
	id: string;
	organizationName: string;
	feedbackType: FeedbackType;
	message: string;
	context: string | null;
	priority: FeedbackPriority;
	status: FeedbackStatus;
	decision: FeedbackDecision | null;
	decisionNotes: string | null;
	createdAt: string;
}

const FOUNDER_FEEDBACK_LIMIT = 100;

/**
 * Phase 20D -- feedback across every organization, for founder triage.
 * Same table as src/lib/feedback/data.ts's getRecentFeedback(), but that
 * function is RLS-scoped to one organization by design (a customer only
 * ever sees their own feedback); this is the cross-organization read a
 * founder needs, gated the same way as the rest of this module.
 */
export async function getFounderFeedback(): Promise<FounderFeedbackRow[]> {
	const supabase = createAdminClient();

	const { data, error } = await supabase
		.from('customer_feedback')
		.select(
			'id, feedback_type, message, context, priority, status, decision, decision_notes, created_at, organizations(name)',
		)
		.order('created_at', { ascending: false })
		.limit(FOUNDER_FEEDBACK_LIMIT);

	if (error) {
		console.error('[founder] fetching feedback:', error);
		return [];
	}

	return (data ?? []).map(row => ({
		id: row.id,
		organizationName: (row.organizations as { name: string } | null)?.name ?? 'Unknown organization',
		feedbackType: row.feedback_type as FeedbackType,
		message: row.message,
		context: row.context,
		priority: row.priority as FeedbackPriority,
		status: row.status as FeedbackStatus,
		decision: (row.decision as FeedbackDecision | null) ?? null,
		decisionNotes: row.decision_notes,
		createdAt: row.created_at,
	}));
}

function isPilotStatus(value: string): value is PilotStatus {
	return (PILOT_STATUSES as readonly string[]).includes(value);
}

function countBy<T>(rows: T[], key: (row: T) => string): Map<string, number> {
	const counts = new Map<string, number>();
	for (const row of rows) {
		const k = key(row);
		counts.set(k, (counts.get(k) ?? 0) + 1);
	}
	return counts;
}
