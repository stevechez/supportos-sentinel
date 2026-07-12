import { ArrowRight, CheckCircle2, Lightbulb, TrendingUp } from 'lucide-react';

import { Container } from '@/components/marketing/container';

const recommendations = [
	{
		title: 'Add clearer pricing information',
		description:
			'Customers frequently ask about pricing. Adding clearer information may reduce repetitive questions.',
		impact: 'High impact',
		status: 'Recommended',
		icon: TrendingUp,
	},
	{
		title: 'Improve response time during busy hours',
		description:
			'Customers are waiting longer during peak periods. Faster responses can improve satisfaction.',
		impact: 'Medium impact',
		status: 'Suggested',
		icon: Lightbulb,
	},
	{
		title: 'Expand your service information',
		description:
			'Customers are asking about available services. More detail could help them make decisions faster.',
		impact: 'Medium impact',
		status: 'Suggested',
		icon: CheckCircle2,
	},
];

export default function RecommendationsPage() {
	return (
		<section className="py-10">
			<Container>
				<div className="max-w-3xl">
					<p className="text-sm font-medium uppercase tracking-wide text-brand">
						Recommendations
					</p>

					<h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
						Simple improvements that can make a difference
					</h1>

					<p className="mt-4 text-muted-foreground">
						Sentinel turns customer activity into clear next steps so you always
						know what to focus on.
					</p>
				</div>

				<div className="mt-10 grid gap-4 sm:grid-cols-3">
					<div className="rounded-2xl border border-border bg-card p-5">
						<p className="text-sm text-muted-foreground">Recommended actions</p>

						<p className="mt-2 text-3xl font-semibold">3</p>
					</div>

					<div className="rounded-2xl border border-border bg-card p-5">
						<p className="text-sm text-muted-foreground">High impact</p>

						<p className="mt-2 text-3xl font-semibold">1</p>
					</div>

					<div className="rounded-2xl border border-border bg-card p-5">
						<p className="text-sm text-muted-foreground">Completed</p>

						<p className="mt-2 text-3xl font-semibold">0</p>
					</div>
				</div>

				<div className="mt-10 space-y-5">
					{recommendations.map(item => {
						const Icon = item.icon;

						return (
							<div
								key={item.title}
								className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand/30"
							>
								<div className="flex items-start gap-4">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
										<Icon className="h-5 w-5 text-brand" />
									</div>

									<div className="flex-1">
										<div className="flex flex-col justify-between gap-2 sm:flex-row">
											<h2 className="font-medium text-foreground">
												{item.title}
											</h2>

											<span className="text-sm text-muted-foreground">
												{item.impact}
											</span>
										</div>

										<p className="mt-2 text-sm leading-6 text-muted-foreground">
											{item.description}
										</p>

										<button className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand">
											View recommendation
											<ArrowRight className="h-4 w-4" />
										</button>
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
