'use server';

import { redirect } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';

import { createClient } from '../supabase/server';
import { getStripe } from '@supportos/billing/stripe';
import type { Database } from '@supportos/database/types';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

function slugify(input: string) {
	const base = input
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

	// Add a short random suffix so two businesses with the same name don't
	// collide on the unique `slug` column.
	const suffix = Math.random().toString(36).slice(2, 8);

	return `${base || 'workspace'}-${suffix}`;
}

/**
 * Ensures the signed-in user has a workspace, creating one (plus a Stripe
 * Checkout session) the first time they ever land here with a real session —
 * whether that's immediately after signup (email confirmation off) or on
 * their first login after confirming their email (confirmation on). Returns
 * a Checkout URL only when a *new* workspace was just created, so returning
 * users don't get re-sent to Stripe on every login.
 */
async function ensureWorkspace(
	supabase: SupabaseClient<Database>,
	userId: string,
	email: string,
	businessName: string,
): Promise<{ checkoutUrl: string | null }> {
	const { data: existingMembership } = await supabase
		.from('members')
		.select('id')
		.eq('user_id', userId)
		.maybeSingle();

	if (existingMembership) {
		return { checkoutUrl: null };
	}

	const { data: organizationId, error: workspaceError } = await supabase.rpc(
		'create_workspace',
		{
			p_name: businessName,
			p_slug: slugify(businessName),
		},
	);

	if (workspaceError) {
		throw new Error(workspaceError.message);
	}

	const priceId = process.env.STRIPE_PRICE_ID;

	// Billing isn't configured yet — let them into the product without
	// blocking on checkout rather than dead-ending the flow.
	if (!priceId) {
		return { checkoutUrl: null };
	}

	try {
		const stripe = getStripe();

		const session = await stripe.checkout.sessions.create({
			mode: 'subscription',
			customer_email: email,
			client_reference_id: organizationId ?? undefined,
			line_items: [{ price: priceId, quantity: 1 }],
			success_url: `${siteUrl}/dashboard?checkout=success`,
			cancel_url: `${siteUrl}/dashboard?checkout=cancelled`,
			metadata: organizationId ? { organization_id: organizationId } : undefined,
		});

		return { checkoutUrl: session.url };
	} catch (err) {
		// Don't let a Stripe outage block account creation — they land in the
		// product and can subscribe from /pricing instead.
		console.error('Stripe checkout session failed:', err);
		return { checkoutUrl: null };
	}
}

export async function signup(formData: FormData) {
	const business = String(formData.get('business') ?? '').trim();
	const email = String(formData.get('email') ?? '').trim();
	const password = String(formData.get('password') ?? '');

	if (!business || !email || !password) {
		redirect('/signup?error=Please+fill+in+every+field');
	}

	if (password.length < 8) {
		redirect('/signup?error=Password+must+be+at+least+8+characters');
	}

	const supabase = await createClient();

	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		// Stashed so the first post-confirmation login can name the
		// workspace — the signup form is the only place we ever collect it.
		options: { data: { business_name: business } },
	});

	if (error) {
		redirect(`/signup?error=${encodeURIComponent(error.message)}`);
	}

	// Supabase doesn't return an error for a duplicate signup (to avoid
	// leaking which emails are registered) — instead the returned user has
	// an empty `identities` array. Surface that clearly instead of silently
	// showing "check your email" for an email that will never get one.
	if (data.user && data.user.identities && data.user.identities.length === 0) {
		redirect(
			'/signup?error=' +
				encodeURIComponent(
					'An account with this email already exists. Log in instead, or use "Resend confirmation email" if you never confirmed it.',
				),
		);
	}

	// If email confirmation is required, there's no session yet — the
	// workspace gets created the first time they actually log in.
	if (!data.session || !data.user) {
		redirect(
			`/signup?message=check-email&email=${encodeURIComponent(email)}`,
		);
	}

	let checkoutUrl: string | null = null;

	try {
		({ checkoutUrl } = await ensureWorkspace(
			supabase,
			data.user.id,
			email,
			business,
		));
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Something went wrong';
		redirect(`/signup?error=${encodeURIComponent(message)}`);
	}

	redirect(checkoutUrl ?? '/dashboard');
}

export async function login(formData: FormData) {
	const email = String(formData.get('email') ?? '').trim();
	const password = String(formData.get('password') ?? '');
	const next = String(formData.get('next') ?? '/dashboard');

	if (!email || !password) {
		redirect('/login?error=Please+fill+in+every+field');
	}

	const supabase = await createClient();

	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		redirect(`/login?error=${encodeURIComponent(error.message)}`);
	}

	// redirect() throws internally to interrupt rendering, so it must never
	// sit inside this try/catch — only the ensureWorkspace() call is guarded.
	let checkoutUrl: string | null = null;

	if (data.user) {
		const businessName =
			(data.user.user_metadata?.business_name as string | undefined) ??
			data.user.email?.split('@')[0] ??
			'Workspace';

		try {
			({ checkoutUrl } = await ensureWorkspace(
				supabase,
				data.user.id,
				email,
				businessName,
			));
		} catch (err) {
			const message =
				err instanceof Error ? err.message : 'Something went wrong';
			redirect(`/login?error=${encodeURIComponent(message)}`);
		}
	}

	redirect(checkoutUrl ?? (next.startsWith('/') ? next : '/dashboard'));
}

export async function logout() {
	const supabase = await createClient();
	await supabase.auth.signOut();
	redirect('/');
}

export async function resendConfirmation(formData: FormData) {
	const email = String(formData.get('email') ?? '').trim();

	if (!email) {
		redirect('/signup?error=Missing+email');
	}

	const supabase = await createClient();

	const { error } = await supabase.auth.resend({ type: 'signup', email });

	if (error) {
		redirect(
			`/signup?message=check-email&email=${encodeURIComponent(email)}&error=${encodeURIComponent(error.message)}`,
		);
	}

	redirect(
		`/signup?message=check-email&email=${encodeURIComponent(email)}&resent=1`,
	);
}
