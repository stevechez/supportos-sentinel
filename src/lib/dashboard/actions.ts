'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@supportos/auth/server';

import { getCurrentMembership } from './dashboard';
import {
	FINDING_STATUS_ORDER,
	RECOMMENDATION_STATUS_ORDER,
	type FindingLifecycleStatus,
	type RecommendationLifecycleStatus,
} from './improvement';

export type MutationResult = { ok: true } | { ok: false; error: string };

const GENERIC_ERROR = 'Something went wrong updating this item. Please try again.';

function isFindingStatus(value: string): value is FindingLifecycleStatus {
	return (FINDING_STATUS_ORDER as string[]).includes(value);
}

function isRecommendationStatus(value: string): value is RecommendationLifecycleStatus {
	return (RECOMMENDATION_STATUS_ORDER as string[]).includes(value);
}

/**
 * Moves a finding to a new lifecycle status (Phase 7A). Deliberately only
 * accepts the four known statuses -- not a free-form string -- and stamps
 * resolved_at/resolved_by only when moving into 'resolved', clearing them
 * otherwise, so the audit trail can't drift out of sync with the status.
 * RLS (sentinel_findings_update, requires 'agent' role) is the actual
 * authorization boundary; this only adds a friendly result shape on top.
 */
export async function updateFindingStatusAction(
	findingId: string,
	nextStatus: string,
): Promise<MutationResult> {
	if (!isFindingStatus(nextStatus)) {
		return { ok: false, error: GENERIC_ERROR };
	}

	const membership = await getCurrentMembership();
	if (!membership) {
		return { ok: false, error: "We couldn't verify your organization. Please try again." };
	}

	const supabase = await createClient();

	const { error } = await supabase
		.from('sentinel_findings')
		.update({
			status: nextStatus,
			resolved_at: nextStatus === 'resolved' ? new Date().toISOString() : null,
			resolved_by: nextStatus === 'resolved' ? membership.memberId : null,
		})
		.eq('id', findingId)
		.eq('organization_id', membership.organizationId);

	if (error) {
		console.error('[dashboard] updating finding status:', error);
		return { ok: false, error: GENERIC_ERROR };
	}

	revalidatePath('/dashboard');
	return { ok: true };
}

/**
 * Moves a recommendation to a new lifecycle status (Phase 7B). Same shape
 * as updateFindingStatusAction -- stamps completed_at/completed_by only
 * when moving into 'completed'.
 */
export async function updateRecommendationStatusAction(
	recommendationId: string,
	nextStatus: string,
): Promise<MutationResult> {
	if (!isRecommendationStatus(nextStatus)) {
		return { ok: false, error: GENERIC_ERROR };
	}

	const membership = await getCurrentMembership();
	if (!membership) {
		return { ok: false, error: "We couldn't verify your organization. Please try again." };
	}

	const supabase = await createClient();

	const { error } = await supabase
		.from('sentinel_recommendations')
		.update({
			status: nextStatus,
			completed_at: nextStatus === 'completed' ? new Date().toISOString() : null,
			completed_by: nextStatus === 'completed' ? membership.memberId : null,
		})
		.eq('id', recommendationId)
		.eq('organization_id', membership.organizationId);

	if (error) {
		console.error('[dashboard] updating recommendation status:', error);
		return { ok: false, error: GENERIC_ERROR };
	}

	revalidatePath('/dashboard');
	return { ok: true };
}
