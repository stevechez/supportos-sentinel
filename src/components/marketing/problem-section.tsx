import { HelpCircle, FileQuestion, RefreshCcw, EyeOff } from 'lucide-react';

import { Container } from './container';
import { Reveal } from './reveal';

// Phase 17B -- the "Problem" section the homepage was missing. Every other
// section on this page explains what Sentinel does; this one explains why
// that's worth paying for, named in the customer's own language rather than
// Sentinel's. No AI/architecture terms here on purpose.
const painPoints = [
	{
		icon: RefreshCcw,
		title: 'The same questions, over and over',
		description:
			'Your team answers the same handful of questions every week, and no one has time to notice the pattern.',
	},
	{
		icon: FileQuestion,
		title: 'Documentation gaps you can’t see',
		description:
			'Customers hit the same confusing spot in your product or docs, and each one looks like a one-off — until it isn’t.',
	},
	{
		icon: EyeOff,
		title: 'Issues that build up quietly',
		description:
			'Small, recurring friction doesn’t show up in any report until it’s already a real problem.',
	},
	{
		icon: HelpCircle,
		title: 'No clear next step',
		description:
			'You can see that something is off, but not what to fix first, or whether the fix actually worked.',
	},
];

export function ProblemSection() {
	return (
		<section className="border-y border-white/10 bg-white/[0.015] py-24 sm:py-32">
			<Container>
				<Reveal className="mx-auto max-w-2xl text-center">
					<p className="mb-4 text-xs font-medium tracking-[0.14em] text-brand uppercase">
						The problem
					</p>

					<h2 className="font-heading text-3xl text-foreground sm:text-4xl">
						Support teams already know something&apos;s off.
						<br />
						They just can&apos;t see what, or why.
					</h2>
				</Reveal>

				<div className="mt-16 grid gap-6 sm:grid-cols-2">
					{painPoints.map((point, index) => {
						const Icon = point.icon;

						return (
							<Reveal key={point.title} delay={index * 80}>
								<div className="flex gap-4 rounded-2xl border border-white/10 bg-card p-6">
									<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10">
										<Icon className="h-5 w-5 text-brand" aria-hidden="true" />
									</div>

									<div>
										<h3 className="font-medium text-foreground">{point.title}</h3>
										<p className="mt-2 text-sm leading-6 text-muted-foreground">
											{point.description}
										</p>
									</div>
								</div>
							</Reveal>
						);
					})}
				</div>
			</Container>
		</section>
	);
}
