import Link from 'next/link';

import { Container } from '@/components/marketing/container';
import { SubmitButton } from '@/components/marketing/submit-button';
import { signup, resendConfirmation } from '@/lib/actions/auth';

export const metadata = {
	title: 'Get Started | Sentinel',
	description: 'Create your Sentinel account.',
};

export default async function SignupPage({
	searchParams,
}: {
	searchParams: Promise<{
		error?: string;
		message?: string;
		email?: string;
		resent?: string;
	}>;
}) {
	const { error, message, email, resent } = await searchParams;

	if (message === 'check-email') {
		return (
			<section className="flex min-h-[calc(100vh-4rem)] items-center py-16">
				<Container>
					<div className="mx-auto w-full max-w-sm text-center">
						<h1 className="font-heading text-3xl text-foreground">
							Check your email
						</h1>

						<p className="mt-4 text-sm leading-6 text-muted-foreground">
							We sent a confirmation link{email ? <> to <span className="text-foreground/90">{email}</span></> : null}. Once
							you confirm your address, log in to finish setting up your
							workspace.
						</p>

						{resent ? (
							<p className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-400">
								Confirmation email resent.
							</p>
						) : null}

						{error ? (
							<p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
								{error}
							</p>
						) : null}

						<p className="mt-6 text-xs text-muted-foreground">
							Didn&apos;t get it? Check spam, or resend below.
						</p>

						{email ? (
							<form action={resendConfirmation} className="mt-3">
								<input type="hidden" name="email" value={email} />
								<button
									type="submit"
									className="text-sm font-medium text-brand hover:underline"
								>
									Resend confirmation email
								</button>
							</form>
						) : null}

						<Link
							href="/login"
							className="mt-8 inline-block rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
						>
							Go to login
						</Link>
					</div>
				</Container>
			</section>
		);
	}

	return (
		<section className="flex min-h-[calc(100vh-4rem)] items-center py-16">
			<Container>
				<div className="mx-auto w-full max-w-sm">
					<div className="text-center">
						<h1 className="font-heading text-3xl text-foreground">
							Get started with Sentinel
						</h1>

						<p className="mt-3 text-sm text-muted-foreground">
							No complicated setup. No technical expertise required.
						</p>
					</div>

					<form action={signup} className="mt-10 space-y-4">
						{error ? (
							<p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
								{error}
							</p>
						) : null}

						<div>
							<label
								htmlFor="business"
								className="mb-1.5 block text-sm font-medium text-foreground/90"
							>
								Business name
							</label>
							<input
								id="business"
								name="business"
								type="text"
								required
								placeholder="Acme Co."
								className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-brand/50 focus:ring-2 focus:ring-brand/30"
							/>
						</div>

						<div>
							<label
								htmlFor="email"
								className="mb-1.5 block text-sm font-medium text-foreground/90"
							>
								Work email
							</label>
							<input
								id="email"
								name="email"
								type="email"
								required
								placeholder="you@company.com"
								className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-brand/50 focus:ring-2 focus:ring-brand/30"
							/>
						</div>

						<div>
							<label
								htmlFor="password"
								className="mb-1.5 block text-sm font-medium text-foreground/90"
							>
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								required
								minLength={8}
								placeholder="••••••••"
								className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-brand/50 focus:ring-2 focus:ring-brand/30"
							/>
							<p className="mt-1.5 text-xs text-muted-foreground">
								At least 8 characters.
							</p>
						</div>

						<SubmitButton pendingLabel="Creating account…">
							Create account
						</SubmitButton>
					</form>

					<p className="mt-8 text-center text-sm text-muted-foreground">
						Already have an account?{' '}
						<Link href="/login" className="font-medium text-brand hover:underline">
							Log in
						</Link>
					</p>
				</div>
			</Container>
		</section>
	);
}
