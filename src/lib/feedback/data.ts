import type { createClient } from '@supportos/auth/server';

import type { FeedbackEntry, FeedbackPriority, FeedbackStatus, FeedbackType } from './types';

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/** How many recent feedback items the pilot-facing views show at once. */
const FEEDBACK_LIMIT = 50;

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
		.select('id, feedback_type, message, context, priority, status, created_at, members(display_name)')
		.eq('organization_id', organizationId)
		.order('created_at', { ascending: false })
		.limit(FEEDBACK_LIMIT);

	if (error) {
		console.error('[feedback] fetching recent feedback:', error);
		return [];
	}

	return (data ?? []).map(row => ({
		id: row.id,
		memberName: (row.members as { display_name: string | null } | null)?.display_name ?? null,
		feedbackType: row.feedback_type as FeedbackType,
		message: row.message,
		context: row.context,
		priority: row.priority as FeedbackPriority,
		status: row.status as FeedbackStatus,
		createdAt: row.created_at,
	}));
}
