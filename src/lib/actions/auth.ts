'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

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

	const { data, error } = await supabase.auth.signUp({ email, password });

	if (error) {
		redirect(`/signup?error=${encodeURIComponent(error.message)}`);
	}

	// If email confirmation is required, there's no session yet — the
	// workspace gets created the first time they actually log in.
	if (!data.session) {
		redirect(
			`/signup?message=check-email&email=${encodeURIComponent(email)}`,
		);
	}

	const { error: workspaceError } = await supabase.rpc('create_workspace', {
		p_name: business,
		p_slug: slugify(business),
	});

	if (workspaceError) {
		redirect(`/signup?error=${encodeURIComponent(workspaceError.message)}`);
	}

	redirect('/dashboard');
}

export async function login(formData: FormData) {
	const email = String(formData.get('email') ?? '').trim();
	const password = String(formData.get('password') ?? '');
	const next = String(formData.get('next') ?? '/dashboard');

	if (!email || !password) {
		redirect('/login?error=Please+fill+in+every+field');
	}

	const supabase = await createClient();

	const { error } = await supabase.auth.signInWithPassword({ email, password });

	if (error) {
		redirect(`/login?error=${encodeURIComponent(error.message)}`);
	}

	redirect(next.startsWith('/') ? next : '/dashboard');
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
