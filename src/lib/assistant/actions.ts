'use server';

import { createClient } from '@supportos/auth/server';

import { getCurrentMembership } from '@/lib/dashboard/dashboard';
import { generateCustomerAnswer } from '@/lib/ai/analyst';
import { AiUnavailableError } from '@/lib/ai/types';
import { logActivity } from '@/lib/activity';

// Phase 21D -- the AI Assistant's minimal real loop:
//
//   Customer asks -> AI answers -> conversation stored -> SupportOS
//   updates -> Sentinel learns (on the next sync)
//
// This is the first server action in the product that lets AI-generated
// content become part of a customer's real ticket/message history rather
// than only ever explaining Sentinel's already-computed output. Scoped
// deliberately narrow to keep that boundary honest:
//   - one question, one answer -- no multi-turn conversation, no memory
//     of previous turns, no autonomy beyond a single reply
//   - the AI never decides a finding, priority, or health score; it only
//     ever writes into `messages`, exactly like a support agent's reply
//     would, fully visible afterward in the Inbox
//   - if the AI call fails, the customer's question is still saved as a
//     real, open, unresolved ticket -- exactly what happens today if a
//     human hasn't answered yet, not a special error state
//
// Sentinel doesn't have to be taught anything new to "learn" from this:
// the next SupportOS sync (src/lib/signals/sync.ts) reads tickets/messages
// the same way it reads every other conversation, so a demo question here
// becomes eligible to show up as a signal/pattern/finding exactly like any
// other conversation would.

const MAX_QUESTION_LENGTH = 2000;
const DEFAULT_CUSTOMER_NAME = 'Demo Customer';

export type AskAssistantResult =
	| { ok: true; answer: string; ticketId: string }
	| { ok: false; error: string };

function buildSubject(question: string): string {
	const trimmed = question.trim();
	return trimmed.length > 80 ? `${trimmed.slice(0, 77)}...` : trimmed;
}

async function findOrCreateCustomer(
	supabase: Awaited<ReturnType<typeof createClient>>,
	organizationId: string,
	name: string,
	email: string,
): Promise<string | null> {
	const { data: existing } = await supabase
		.from('customers')
		.select('id')
		.eq('organization_id', organizationId)
		.eq('email', email)
		.maybeSingle();

	if (existing) {
		return existing.id;
	}

	const { data: created, error } = await supabase
		.from('customers')
		.insert({ organization_id: organizationId, name, email })
		.select('id')
		.single();

	if (error) {
		console.error('[assistant] creating customer:', error);
		return null;
	}

	return created?.id ?? null;
}

export async function askAssistantAction(
	customerName: string,
	customerEmail: string,
	question: string,
): Promise<AskAssistantResult> {
	const trimmedQuestion = question.trim();
	if (!trimmedQuestion) {
		return { ok: false, error: 'Enter a question first.' };
	}
	if (trimmedQuestion.length > MAX_QUESTION_LENGTH) {
		return { ok: false, error: 'That question is too long for this demo -- try something shorter.' };
	}

	const membership = await getCurrentMembership();
	if (!membership) {
		return { ok: false, error: "We couldn't find your organization." };
	}

	const supabase = await createClient();
	const name = customerName.trim() || DEFAULT_CUSTOMER_NAME;
	const email = customerEmail.trim() || 'demo-customer@example.com';

	const customerId = await findOrCreateCustomer(supabase, membership.organizationId, name, email);

	const { data: ticket, error: ticketError } = await supabase
		.from('tickets')
		.insert({
			organization_id: membership.organizationId,
			customer_id: customerId,
			subject: buildSubject(trimmedQuestion),
			channel: 'ai_assistant',
			status: 'open',
		})
		.select('id')
		.single();

	if (ticketError || !ticket) {
		console.error('[assistant] creating ticket:', ticketError);
		return { ok: false, error: "Something went wrong saving this conversation. Please try again." };
	}

	const { error: customerMessageError } = await supabase.from('messages').insert({
		organization_id: membership.organizationId,
		ticket_id: ticket.id,
		sender: 'customer',
		body: trimmedQuestion,
	});

	if (customerMessageError) {
		console.error('[assistant] saving customer message:', customerMessageError);
		return { ok: false, error: "Something went wrong saving this conversation. Please try again." };
	}

	try {
		const { answer } = await generateCustomerAnswer({ question: trimmedQuestion });

		const { error: aiMessageError } = await supabase.from('messages').insert({
			organization_id: membership.organizationId,
			ticket_id: ticket.id,
			sender: 'ai',
			body: answer,
		});

		if (aiMessageError) {
			console.error('[assistant] saving AI message:', aiMessageError);
			return { ok: false, error: 'The AI answered, but saving the reply failed. Please try again.' };
		}

		const nowIso = new Date().toISOString();
		await supabase
			.from('tickets')
			.update({
				ai_resolved: true,
				status: 'resolved',
				first_response_at: nowIso,
				resolved_at: nowIso,
				decision_path: 'auto',
				decision_reason: 'Answered directly by the AI Assistant.',
			})
			.eq('id', ticket.id)
			.eq('organization_id', membership.organizationId);

		// Phase 22B: the AI Assistant is a second real path to activation
		// data, alongside connecting a source -- log it the same way
		// signed_up/synced_signals already are, so the existing activity_log
		// funnel (docs/product/activation-funnel.md) can see it too.
		await logActivity(supabase, {
			organizationId: membership.organizationId,
			memberId: membership.memberId,
			action: 'asked_assistant',
			entityType: 'ticket',
			entityId: ticket.id,
		});

		return { ok: true, answer, ticketId: ticket.id };
	} catch (error) {
		// The question is already saved as a real, open ticket -- an AI
		// failure here degrades to "no one has answered yet" rather than
		// losing the customer's question or leaving a broken record.
		if (error instanceof AiUnavailableError) {
			return { ok: false, error: error.message };
		}
		console.error('[assistant] unexpected error generating answer:', error);
		return { ok: false, error: 'Something went wrong generating an answer. Please try again.' };
	}
}
