import { AlertCircle, FileQuestion, Lightbulb } from 'lucide-react';

import { Container } from '@/components/marketing/container';

const gaps = [
	{
		title: 'Pricing information needs clarity',
		description:
			'Customers frequently ask about pricing details. Adding clearer information could reduce repeated questions.',
		impact: 'High priority',
		icon: AlertCircle,
	},
	{
		title: 'Service availability is unclear',
		description:
			'Customers are asking about scheduling, availability, and what services are included.',
		impact: 'Opportunity',
		icon: FileQuestion,
	},
	{
		title: 'Customers need clearer next steps',
		description:
			'Some conversations show customers are unsure what happens after contacting your business.',
		impact: 'Opportunity',
		icon: Lightbulb,
	},
];

export default function KnowledgeGapsPage() {
	return (
		<section className="py-10">
			<Container>
				<div className="max-w-3xl">
					<p className="text-sm font-medium uppercase tracking-wide text-brand">
						Knowledge Gaps
					</p>

					<h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
						Where customers need more clarity
					</h1>

					<p className="mt-4 text-muted-foreground">
						Sentinel identifies questions customers ask most often and shows
						where your business information can improve.
					</p>
				</div>

				<div className="mt-10 grid gap-4 sm:grid-cols-3">
					<div className="rounded-2xl border border-border bg-card p-5">
						<p className="text-sm text-muted-foreground">Gaps discovered</p>

						<p className="mt-2 text-3xl font-semibold">3</p>
					</div>

					<div className="rounded-2xl border border-border bg-card p-5">
						<p className="text-sm text-muted-foreground">High priority</p>

						<p className="mt-2 text-3xl font-semibold">1</p>
					</div>

					<div className="rounded-2xl border border-border bg-card p-5">
						<p className="text-sm text-muted-foreground">Opportunities</p>

						<p className="mt-2 text-3xl font-semibold">2</p>
					</div>
				</div>

				<div className="mt-10 space-y-5">
					<h2 className="text-xl font-semibold text-foreground">
						Customer questions Sentinel noticed
					</h2>

					{gaps.map(gap => {
						const Icon = gap.icon;

						return (
							<div
								key={gap.title}
								className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand/30"
							>
								<div className="flex items-start gap-4">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
										<Icon className="h-5 w-5 text-brand" />
									</div>

									<div>
										<h3 className="font-medium text-foreground">{gap.title}</h3>

										<p className="mt-2 text-sm leading-6 text-muted-foreground">
											{gap.description}
										</p>

										<p className="mt-4 text-xs font-medium uppercase tracking-wide text-brand">
											{gap.impact}
										</p>
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
