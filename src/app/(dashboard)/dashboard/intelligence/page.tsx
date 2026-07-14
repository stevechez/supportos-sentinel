import { Bot, Brain, MessageCircle, Sparkles } from 'lucide-react';

import { Container } from '@/components/marketing/container';

const intelligence = [
	{
		title: 'Customer Assistant',
		description:
			'Helps answer common customer questions and keeps conversations moving.',
		status: 'Active',
		detail: 'Helping with customer conversations',
		icon: MessageCircle,
	},
	{
		title: 'Conversation Intelligence',
		description:
			'Identifies trends, recurring questions, and opportunities to improve.',
		status: 'Active',
		detail: 'Analyzing customer activity',
		icon: Brain,
	},
	{
		title: 'Knowledge Assistant',
		description:
			'Uses your business information to provide better, more accurate answers.',
		status: 'Ready',
		detail: 'Learning from your information',
		icon: Bot,
	},
];

export default function IntelligencePage() {
	return (
		<section className="py-10">
			<Container>
				<div className="max-w-3xl">
					<p className="text-sm font-medium uppercase tracking-wide text-brand">
						AI Assistants
					</p>

					<h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
						Your AI assistant working behind the scenes
					</h1>

					<p className="mt-4 text-muted-foreground">
						Sentinel handles routine customer interactions, finds patterns, and
						helps you understand what matters.
					</p>
				</div>

				<div className="mt-10 space-y-5">
					{intelligence.map(item => {
						const Icon = item.icon;

						return (
							<div
								key={item.title}
								className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand/30"
							>
								<div className="flex items-start gap-4">
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
										<Icon className="h-5 w-5 text-brand" />
									</div>

									<div className="flex-1">
										<div className="flex flex-col justify-between gap-2 sm:flex-row">
											<h2 className="font-medium text-foreground">
												{item.title}
											</h2>

											<span className="text-sm text-brand">{item.status}</span>
										</div>

										<p className="mt-2 text-sm leading-6 text-muted-foreground">
											{item.description}
										</p>

										<div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
											<Sparkles className="h-4 w-4 text-brand" />
											{item.detail}
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</Container>
		</section>
	);
}
