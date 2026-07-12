import { Globe, MessageSquare, Users, Sparkles } from 'lucide-react';

import { Container } from './container';

const steps = [
	{
		icon: Globe,
		title: 'Customers visit your website',
		description:
			'People ask questions, explore your services, and look for answers.',
	},
	{
		icon: MessageSquare,
		title: 'Conversations happen naturally',
		description:
			'Every question and interaction becomes organized and easy to understand.',
	},
	{
		icon: Users,
		title: 'Your team stays connected',
		description: 'Customer conversations and support stay in one simple place.',
	},
	{
		icon: Sparkles,
		title: 'Your business gets smarter',
		description:
			'Over time, Sentinel helps you understand what customers need.',
	},
];

export function BusinessFlowSection() {
	return (
		<section id="how-it-works" className="py-24 sm:py-32">
			<Container>
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="font-heading text-3xl text-foreground sm:text-4xl">
						Everything works together.
					</h2>

					<p className="mt-6 text-lg leading-8 text-muted-foreground">
						Sentinel connects the moments that matter — from the first customer
						question to ongoing support and business insight.
					</p>
				</div>

				<div className="mt-16 grid gap-4 md:grid-cols-4">
					{steps.map((step, index) => {
						const Icon = step.icon;

						return (
							<div
								key={step.title}
								className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-colors hover:bg-white/[0.04]"
							>
								<div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10">
									<Icon className="h-5 w-5 text-brand" />
								</div>

								<div className="mb-2 text-xs font-medium tracking-wide text-muted-foreground">
									Step {index + 1}
								</div>

								<h3 className="text-base font-medium text-foreground">
									{step.title}
								</h3>

								<p className="mt-3 text-sm leading-6 text-muted-foreground">
									{step.description}
								</p>
							</div>
						);
					})}
				</div>
			</Container>
		</section>
	);
}
