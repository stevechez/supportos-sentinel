import Link from 'next/link';

import { Container } from '@/components/marketing/container';
import { SubmitButton } from '@/components/marketing/submit-button';
import { login } from '@/lib/actions/auth';

export const metadata = {
	title: 'Log in | Sentinel',
	description: 'Log in to your Sentinel account.',
};

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string; next?: string }>;
}) {
	const { error, next } = await searchParams;

	return (
		<section className="flex min-h-[calc(100vh-4rem)] items-center py-16">
			<Container>
				<div className="mx-auto w-full max-w-sm">
					<div className="text-center">
						<h1 className="font-heading text-3xl text-foreground">
							Welcome back
						</h1>

						<p className="mt-3 text-sm text-muted-foreground">
							Log in to your Sentinel account.
						</p>
					</div>

					<form action={login} className="mt-10 space-y-4">
						{next ? <input type="hidden" name="next" value={next} /> : null}

						{error ? (
							<p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
								{error}
							</p>
						) : null}

						<div>
							<label
								htmlFor="email"
								className="mb-1.5 block text-sm font-medium text-foreground/90"
							>
								Email
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
								placeholder="••••••••"
								className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-brand/50 focus:ring-2 focus:ring-brand/30"
							/>
						</div>

						<SubmitButton pendingLabel="Logging in…">Log in</SubmitButton>
					</form>

					<p className="mt-8 text-center text-sm text-muted-foreground">
						Don&apos;t have an account?{' '}
						<Link href="/signup" className="font-medium text-brand hover:underline">
							Get started
						</Link>
					</p>
				</div>
			</Container>
		</section>
	);
}
