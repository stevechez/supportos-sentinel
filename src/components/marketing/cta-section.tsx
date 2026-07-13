import Link from 'next/link';

import { Container } from './container';
import { Reveal } from './reveal';

export function CtaSection() {
	return (
		<section className="py-24 sm:py-32">
			<Container>
				<div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card px-6 py-16 text-center sm:px-12 sm:py-20">
					<div
						aria-hidden
						className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center"
					>
						<div className="h-64 w-[36rem] rounded-full bg-brand/10 blur-[100px]" />
					</div>

					<Reveal className="mx-auto max-w-2xl">
						<h2 className="font-heading text-3xl text-foreground sm:text-4xl">
							Ready to simplify your business?
						</h2>

						<p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
							Start using Sentinel and let your AI assistant help manage the
							conversations, support, and insights that keep your business
							moving.
						</p>

						<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
							<Link
								href="/signup"
								className="rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
							>
								Get Started
							</Link>
						</div>

						<p className="mt-6 text-sm text-muted-foreground">
							Simple setup. Everything connected.
						</p>
					</Reveal>
				</div>
			</Container>
		</section>
	);
}
