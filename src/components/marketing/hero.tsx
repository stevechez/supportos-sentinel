import Link from 'next/link';

import { Container } from './container';
import { DashboardPreview } from './dashboard-preview';

export function Hero() {
	return (
		<section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32">
			{/* Restrained ambient glow — no gradients on content itself */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-x-0 top-[-10rem] -z-10 flex justify-center"
			>
				<div className="h-[28rem] w-[42rem] rounded-full bg-brand/10 blur-[120px]" />
			</div>

			<Container>
				<div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-12">
					<div className="max-w-xl animate-fade-in-up">
						<p className="mb-6 text-xs font-medium tracking-[0.14em] text-brand uppercase">
							Sentinel AI Platform
						</p>

						<h1 className="font-heading text-5xl leading-[1.05] text-foreground sm:text-6xl lg:text-7xl">
							AI that just works
							<br />
							for your business.
						</h1>

						<p className="mt-6 text-lg leading-8 text-muted-foreground">
							Sentinel brings customer conversations, support, and business
							insights together in one simple platform.
						</p>

						<p className="mt-4 text-sm text-muted-foreground">
							No complicated setup. No technical expertise required.
						</p>

						<div className="mt-9 flex flex-wrap gap-4">
							<Link
								href="/signup"
								className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
							>
								Get Started
							</Link>

							<Link
								href="#how-it-works"
								className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-white/5"
							>
								See How It Works
							</Link>
						</div>
					</div>

					<div className="relative animate-fade-in-up [animation-delay:120ms]">
						<div className="aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl shadow-black/40 sm:aspect-[6/5]">
							<DashboardPreview />
						</div>
					</div>
				</div>
			</Container>
		</section>
	);
}
