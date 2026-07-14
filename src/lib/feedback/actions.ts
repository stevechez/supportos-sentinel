'use server';

import { createClient } from '@supportos/auth/server';

import { logActivity } from '@/lib/activity';
import { getCurrentMembership } from '@/lib/dashboard/dashboard';

import type { FeedbackType } from './types';

export type SubmitFeedbackResult = { ok: true } | { ok: false; error: string };

const GENERIC_ERROR = "We couldn't submit that feedback. Please try again.";

const FEEDBACK_TYPES: FeedbackType[] = ['confusion', 'missing_capability', 'bug', 'value'];

function isFeedbackType(value: string): value is FeedbackType {
	return (FEEDBACK_TYPES as string[]).includes(value);
}

/**
 * Phase 18D/E -- the one write path behind every feedback surface in the
 * product (the global widget and the per-insight "Was this useful?"
 * prompts alike). Deliberately a single, small action: a fixed category, a
 * message, and an optional free-text context string identifying where the
 * feedback came from (e.g. "ai_executive_brief") -- not a generic form
 * builder. Feedback is logged to activity_log too (action
 * 'submitted_feedback') so it shows up in the same audit trail as every
 * other thing a member did, keeping one timeline instead of two.
 */
export async function submitFeedbackAction(
	feedbackType: string,
	message: string,
	context?: string,
): Promise<SubmitFeedbackResult> {
	if (!isFeedbackType(feedbackType)) {
		return { ok: false, error: GENERIC_ERROR };
	}

	const trimmed = message.trim();
	if (!trimmed) {
		return { ok: false, error: 'Please add a few words so we know what you mean.' };
	}

	const membership = await getCurrentMembership();
	if (!membership) {
		return { ok: false, error: "We couldn't verify your organization. Please try again." };
	}

	const supabase = await createClient();

	const { data: inserted, error } = await supabase
		.from('customer_feedback')
		.insert({
			organization_id: membership.organizationId,
			member_id: membership.memberId,
			feedback_type: feedbackType,
			message: trimmed,
			context: context ?? null,
		})
		.select('id')
		.single();

	if (error) {
		console.error('[feedback] submitting feedback:', error);
		return { ok: false, error: GENERIC_ERROR };
	}

	await logActivity(supabase, {
		organizationId: membership.organizationId,
		memberId: membership.memberId,
		action: 'submitted_feedback',
		entityType: 'customer_feedback',
		entityId: inserted?.id,
		metadata: { feedbackType },
	});

	return { ok: true };
}
