import Link from 'next/link';

import { Container } from '@/components/marketing/container';
import { SignupForm } from '@/components/marketing/signup-form';
import { resendConfirmation } from '@supportos/auth/actions';

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

					<SignupForm initialError={error} />

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
