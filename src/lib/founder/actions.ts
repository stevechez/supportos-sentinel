'use server';

import { revalidatePath } from 'next/cache';

import { createAdminClient } from '@supportos/auth/admin';

import { isFounder } from './auth';
import { PILOT_STATUSES, type PilotStatus } from './data';

export type FounderActionResult = { ok: true } | { ok: false; error: string };

const NOT_FOUNDER_ERROR = 'Not authorized.';
const GENERIC_ERROR = 'Something went wrong. Please try again.';

function isPilotStatus(value: string): value is PilotStatus {
	return (PILOT_STATUSES as readonly string[]).includes(value);
}

/**
 * Phase 20B -- the only mutation on the founder dashboard that touches
 * another organization's row. Uses the service-role admin client (the
 * normal RLS update policy on organizations requires 'admin' role
 * *within that organization*, which a founder checking in on a pilot they
 * aren't a member of will never have) -- but only after re-verifying
 * isFounder() server-side, never trusting that the page already checked
 * it. No other field on organizations is writable from this action.
 */
export async function updatePilotStatusAction(
	organizationId: string,
	nextStatus: string,
): Promise<FounderActionResult> {
	if (!(await isFounder())) {
		return { ok: false, error: NOT_FOUNDER_ERROR };
	}

	if (!isPilotStatus(nextStatus)) {
		return { ok: false, error: GENERIC_ERROR };
	}

	const supabase = createAdminClient();

	const update: { pilot_status: PilotStatus; pilot_started_at?: string } = { pilot_status: nextStatus };

	// The first time a pilot moves into 'active', stamp when that happened
	// -- pilot_started_at is meant to answer "how long has this pilot
	// actually been running," not "when did they sign up."
	if (nextStatus === 'active') {
		const { data: existing } = await supabase
			.from('organizations')
			.select('pilot_started_at')
			.eq('id', organizationId)
			.maybeSingle();

		if (!existing?.pilot_started_at) {
			update.pilot_started_at = new Date().toISOString();
		}
	}

	const { error } = await supabase.from('organizations').update(update).eq('id', organizationId);

	if (error) {
		console.error('[founder] updating pilot status:', error);
		return { ok: false, error: GENERIC_ERROR };
	}

	revalidatePath('/dashboard/founder');
	return { ok: true };
}

/**
 * Phase 20B -- primary contact is the one other organization-level field
 * this page can edit. Same founder-gate, same admin client, same reason.
 */
export async function updatePilotContactAction(
	organizationId: string,
	name: string,
	email: string,
): Promise<FounderActionResult> {
	if (!(await isFounder())) {
		return { ok: false, error: NOT_FOUNDER_ERROR };
	}

	const supabase = createAdminClient();

	const { error } = await supabase
		.from('organizations')
		.update({
			primary_contact_name: name.trim() || null,
			primary_contact_email: email.trim() || null,
		})
		.eq('id', organizationId);

	if (error) {
		console.error('[founder] updating pilot contact:', error);
		return { ok: false, error: GENERIC_ERROR };
	}

	revalidatePath('/dashboard/founder');
	return { ok: true };
}

const FEEDBACK_DECISIONS = ['build', 'fix', 'document', 'ignore', 'investigate'] as const;

function isFeedbackDecision(value: string): value is (typeof FEEDBACK_DECISIONS)[number] {
	return (FEEDBACK_DECISIONS as readonly string[]).includes(value);
}

/**
 * Phase 20D -- turning a feedback item into a decision. Deliberately
 * separate from src/lib/feedback/actions.ts (which only ever handles a
 * customer submitting feedback for their own organization under normal
 * RLS) -- this is the founder-side triage step, needs to work across any
 * organization's feedback, and is gated the same way as every other
 * founder action.
 */
export async function setFeedbackDecisionAction(
	feedbackId: string,
	decision: string,
	notes: string,
): Promise<FounderActionResult> {
	if (!(await isFounder())) {
		return { ok: false, error: NOT_FOUNDER_ERROR };
	}

	if (!isFeedbackDecision(decision)) {
		return { ok: false, error: GENERIC_ERROR };
	}

	const supabase = createAdminClient();

	const { error } = await supabase
		.from('customer_feedback')
		.update({ decision, decision_notes: notes.trim() || null })
		.eq('id', feedbackId);

	if (error) {
		console.error('[founder] setting feedback decision:', error);
		return { ok: false, error: GENERIC_ERROR };
	}

	revalidatePath('/dashboard/founder');
	return { ok: true };
}
