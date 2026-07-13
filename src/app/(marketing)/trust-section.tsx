import { CheckCircle2, Eye, Shield, Sparkles } from 'lucide-react';

import { Container } from '@/components/marketing/container';

const principles = [
	{
		icon: Sparkles,
		title: 'Simple by design',
		description:
			'No complicated setup. No prompt engineering. No AI jargon. Sentinel quietly works in the background and brings you only what matters.',
	},
	{
		icon: Eye,
		title: 'Built around your business',
		description:
			'Sentinel learns how your business operates instead of forcing you to change the way you work. Every recommendation is grounded in your customer conversations.',
	},
	{
		icon: Shield,
		title: 'Technology you can trust',
		description:
			'You stay in control. Sentinel surfaces insights and recommendations, while you decide what happens next.',
	},
];

export function TrustSection() {
	return (
		<section className="py-24 sm:py-32">
			<Container>
				<div className="mx-auto max-w-3xl text-center">
					<p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
						Why businesses choose Sentinel
					</p>

					<h2 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
						The calm operating system for understanding your business.
					</h2>

					<p className="mt-6 text-lg leading-8 text-muted-foreground">
						Most software asks you to manage another dashboard. Sentinel quietly
						watches your customer conversations, identifies patterns, and gives
						you clear recommendations— without adding more work to your day.
					</p>
				</div>

				<div className="mt-20 grid gap-8 lg:grid-cols-3">
					{principles.map(principle => {
						const Icon = principle.icon;

						return (
							<div
								key={principle.title}
								className="group rounded-3xl border border-border bg-card/40 p-8 transition-all duration-300 hover:border-brand/30 hover:bg-card"
							>
								<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10">
									<Icon className="h-6 w-6 text-brand" />
								</div>

								<h3 className="mt-6 text-xl font-semibold text-foreground">
									{principle.title}
								</h3>

								<p className="mt-4 leading-7 text-muted-foreground">
									{principle.description}
								</p>
							</div>
						);
					})}
				</div>

				<div className="mx-auto mt-20 max-w-5xl rounded-3xl border border-brand/20 bg-brand/5 p-10">
					<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
						<div>
							<h3 className="text-2xl font-semibold text-foreground">
								Technology should reduce complexity.
							</h3>

							<p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
								Every decision behind Sentinel is guided by one principle: if
								you need a manual to understand it, we&apos;ve made it too
								complicated. Your business deserves software that simply works.
							</p>
						</div>

						<div className="flex shrink-0 items-center gap-3 rounded-2xl border border-border bg-background px-5 py-4">
							<CheckCircle2 className="h-5 w-5 text-brand" />

							<span className="font-medium text-foreground">
								It just works.
							</span>
						</div>
					</div>
				</div>
			</Container>
		</section>
	);
}
