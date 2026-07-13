import {
	ArrowRight,
	CheckCircle2,
	MessageSquare,
	Sparkles,
	TrendingUp,
} from 'lucide-react';

import { Container } from '@/components/marketing/container';
import { Reveal } from '@/components/marketing/reveal';

const updates = [
	{
		icon: MessageSquare,
		title: '12 customer conversations',
		description:
			'Customers received quick, helpful answers throughout the day.',
	},
	{
		icon: Sparkles,
		title: '3 opportunities discovered',
		description:
			'Sentinel noticed repeated questions that could be answered more clearly.',
	},
	{
		icon: TrendingUp,
		title: '1 recommendation ready',
		description: 'Update your pricing page to reduce repetitive conversations.',
	},
];

export function ProductExperienceSection() {
	return (
		<section className="border-y border-border/50 bg-card/30 py-24 sm:py-32">
			<Container>
				<div className="grid items-center gap-16 lg:grid-cols-2">
					{/* Left Content */}
					<Reveal>
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
							Meet Sentinel
						</p>

						<h2 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
							Your business, understood.
						</h2>

						<p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
							Instead of digging through conversations and reports, Sentinel
							quietly watches what is happening behind the scenes and brings you
							the few things that actually need your attention.
						</p>

						<div className="mt-10 space-y-6">
							{updates.map(update => {
								const Icon = update.icon;

								return (
									<div key={update.title} className="flex items-start gap-4">
										<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10">
											<Icon className="h-5 w-5 text-brand" aria-hidden="true" />
										</div>

										<div>
											<h3 className="font-medium text-foreground">
												{update.title}
											</h3>

											<p className="mt-1 text-sm leading-7 text-muted-foreground">
												{update.description}
											</p>
										</div>
									</div>
								);
							})}
						</div>
					</Reveal>

					{/* Product Preview */}
					<Reveal delay={120} className="relative">
						<div className="overflow-hidden rounded-3xl border border-white/10 bg-background shadow-2xl">
							<div className="border-b border-white/10 px-6 py-5">
								<p className="text-sm text-muted-foreground">Good morning.</p>

								<h3 className="mt-2 text-2xl font-semibold text-foreground">
									Your business is running smoothly.
								</h3>
							</div>

							<div className="space-y-5 p-6">
								<div className="rounded-2xl border border-border bg-card p-5">
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">
											Business Health
										</span>

										<span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
											Excellent
										</span>
									</div>

									<div className="mt-4 h-2 rounded-full bg-muted">
										<div className="h-2 w-[92%] rounded-full bg-brand" />
									</div>
								</div>

								<div className="rounded-2xl border border-border bg-card p-5">
									<div className="flex items-start gap-3">
										<CheckCircle2 className="mt-0.5 h-5 w-5 text-brand" aria-hidden="true" />

										<div>
											<p className="font-medium text-foreground">
												Pricing questions increased this week.
											</p>

											<p className="mt-2 text-sm leading-6 text-muted-foreground">
												Adding a simple pricing FAQ could reduce repeat
												conversations and help customers find answers faster.
											</p>

											<button className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand">
												View recommendation
												<ArrowRight className="h-4 w-4" aria-hidden="true" />
											</button>
										</div>
									</div>
								</div>

								<div className="rounded-2xl border border-border bg-card p-5">
									<p className="text-sm text-muted-foreground">Today</p>

									<div className="mt-4 space-y-3 text-sm">
										<div className="flex justify-between">
											<span>Customer conversations</span>
											<span className="font-medium">12</span>
										</div>

										<div className="flex justify-between">
											<span>Support requests resolved</span>
											<span className="font-medium">3</span>
										</div>

										<div className="flex justify-between">
											<span>Recommendations</span>
											<span className="font-medium">1</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</Reveal>
				</div>
			</Container>
		</section>
	);
}
