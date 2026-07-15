import type { createClient } from '@supportos/auth/server';

import type { FeedbackDecision, FeedbackEntry, FeedbackPriority, FeedbackStatus, FeedbackType } from './types';

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/** How many recent feedback items the pilot-facing views show at once. */
const FEEDBACK_LIMIT = 50;

const FEEDBACK_COLUMNS =
	'id, feedback_type, message, context, priority, status, decision, decision_notes, created_at, members(display_name)';

interface FeedbackRow {
	id: string;
	feedback_type: string;
	message: string;
	context: string | null;
	priority: string;
	status: string;
	decision: string | null;
	decision_notes: string | null;
	created_at: string;
	members: { display_name: string | null } | null;
}

function toFeedbackEntry(row: FeedbackRow): FeedbackEntry {
	return {
		id: row.id,
		memberName: row.members?.display_name ?? null,
		feedbackType: row.feedback_type as FeedbackType,
		message: row.message,
		context: row.context,
		priority: row.priority as FeedbackPriority,
		status: row.status as FeedbackStatus,
		decision: (row.decision as FeedbackDecision | null) ?? null,
		decisionNotes: row.decision_notes,
		createdAt: row.created_at,
	};
}

/**
 * Reads an organization's feedback, newest first, joined to the member's
 * display name where one exists -- same shape and same RLS-scoped pattern
 * as `getRecentActivity` in src/lib/activity.ts (Phase 16A).
 */
export async function getRecentFeedback(
	supabase: SupabaseClient,
	organizationId: string,
): Promise<FeedbackEntry[]> {
	const { data, error } = await supabase
		.from('customer_feedback')
		.select(FEEDBACK_COLUMNS)
		.eq('organization_id', organizationId)
		.order('created_at', { ascending: false })
		.limit(FEEDBACK_LIMIT);

	if (error) {
		console.error('[feedback] fetching recent feedback:', error);
		return [];
	}

	return (data ?? []).map(row => toFeedbackEntry(row as unknown as FeedbackRow));
}
