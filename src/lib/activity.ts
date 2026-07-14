import type { createClient } from '@supportos/auth/server';

import type { Json } from '@/types/database';

// Phase 16A -- the audit trail foundation.
//
// "What happened and when?" Not a compliance system (no SOC2 framework,
// no export, no immutability guarantee) -- just a plain, readable record
// of the things a customer would actually wonder about: who connected a
// source, when Sentinel synced, when a pattern became a finding, when
// something's status changed.
//
// Reuses the `activity_log` table that already existed in the shared
// schema (organization_id, member_id, actor_type, action, entity_type,
// entity_id, metadata, created_at) with RLS already in place -- nothing
// in this codebase had ever written to or read from it before this
// phase. No migration, no new table.
//
// Phase 17H -- this same table is also the activation funnel. Rather than
// standing up a separate analytics vendor or event table, the funnel a
// stranger walks (signup -> connect a source -> reach a first insight) is
// just three of these actions in order: 'signed_up' (added in Phase 17,
// logged once in ensureWorkspace when a workspace is first created),
// 'synced_signals' (a source was connected and data flowed in), and
// 'created_baseline_report' (the first real health report existed -- the
// point a "first insight" became a durable result). Querying
// `activity_log` grouped by action and organization_id is the whole funnel
// report; no new tracking surface was built.

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * The fixed, known set of actions Sentinel logs -- deliberately not a
 * free-form string. Keeping this list closed makes the activity feed
 * predictable to render and easy to extend deliberately, one named event
 * at a time, rather than accumulating ad hoc log lines.
 */
export type ActivityAction =
	| 'signed_up'
	| 'connected_source'
	| 'synced_signals'
	| 'created_baseline_report'
	| 'created_finding_from_pattern'
	| 'updated_finding_status'
	| 'updated_recommendation_status'
	| 'submitted_feedback';

export interface LogActivityInput {
	organizationId: string;
	/** Null for system-initiated events (there are none yet -- every action today is user-triggered), present whenever a member performed the action. */
	memberId: string | null;
	action: ActivityAction;
	entityType?: string;
	entityId?: string;
	metadata?: Record<string, unknown>;
}

/**
 * Writes one activity_log row. Deliberately fire-and-forget from the
 * caller's perspective in spirit -- failures are logged to the server
 * console and swallowed, never thrown, because an audit-trail write
 * should never be the reason a real mutation (syncing, changing a
 * status) fails for the customer.
 */
export async function logActivity(supabase: SupabaseClient, input: LogActivityInput): Promise<void> {
	const { error } = await supabase.from('activity_log').insert({
		organization_id: input.organizationId,
		member_id: input.memberId,
		actor_type: input.memberId ? 'member' : 'system',
		action: input.action,
		entity_type: input.entityType ?? null,
		entity_id: input.entityId ?? null,
		metadata: (input.metadata ?? {}) as Json,
	});

	if (error) {
		console.error('[activity] logging activity:', error);
	}
}

export interface ActivityEntry {
	id: string;
	action: ActivityAction | string;
	actorType: string;
	memberName: string | null;
	entityType: string | null;
	metadata: Record<string, unknown>;
	createdAt: string;
}

/** How many recent events the activity feed shows -- a recent-history view, not a full export. */
const ACTIVITY_FEED_LIMIT = 20;

/**
 * Reads the organization's most recent activity, newest first, joined to
 * the member's display name where one exists. RLS-scoped the same as
 * every other read in this codebase -- a caller only ever sees their own
 * organization's rows.
 */
export async function getRecentActivity(
	supabase: SupabaseClient,
	organizationId: string,
): Promise<ActivityEntry[]> {
	const { data, error } = await supabase
		.from('activity_log')
		.select('id, action, actor_type, entity_type, metadata, created_at, members(display_name)')
		.eq('organization_id', organizationId)
		.order('created_at', { ascending: false })
		.limit(ACTIVITY_FEED_LIMIT);

	if (error) {
		console.error('[activity] fetching recent activity:', error);
		return [];
	}

	return (data ?? []).map(row => ({
		id: row.id,
		action: row.action,
		actorType: row.actor_type,
		memberName: (row.members as { display_name: string | null } | null)?.display_name ?? null,
		entityType: row.entity_type,
		metadata: (row.metadata as Record<string, unknown>) ?? {},
		createdAt: row.created_at,
	}));
}

/**
 * Turns a raw ActivityEntry into the one-line, plain-language sentence
 * the handoff's own example shows ("Steve connected SupportOS" / "Sentinel
 * synced 142 conversations"). Deterministic templating, not AI -- the
 * point of this file is a trustworthy factual record, not an explanation.
 */
export function describeActivity(entry: ActivityEntry): string {
	const who = entry.memberName ?? (entry.actorType === 'system' ? 'Sentinel' : 'Someone');

	switch (entry.action) {
		case 'signed_up':
			return `${who} created the workspace`;
		case 'connected_source':
			return `${who} connected SupportOS`;
		case 'synced_signals': {
			const count = typeof entry.metadata.newSignalCount === 'number' ? entry.metadata.newSignalCount : 0;
			return count > 0
				? `Sentinel synced ${count} new signal${count === 1 ? '' : 's'}`
				: 'Sentinel synced -- no new signals';
		}
		case 'created_baseline_report':
			return `${who} established a health baseline`;
		case 'created_finding_from_pattern':
			return `${who} created a finding from a detected pattern`;
		case 'updated_finding_status': {
			const status = typeof entry.metadata.status === 'string' ? entry.metadata.status : 'updated';
			return `${who} marked a finding as ${status.replace('_', ' ')}`;
		}
		case 'updated_recommendation_status': {
			const status = typeof entry.metadata.status === 'string' ? entry.metadata.status : 'updated';
			return `${who} marked a recommendation as ${status.replace('_', ' ')}`;
		}
		case 'submitted_feedback':
			return `${who} sent feedback`;
		default:
			return `${who} performed an action`;
	}
}
