import { ArrowRight, CheckCircle2, ListChecks } from 'lucide-react';

interface Recommendation {
	id: number;
	title: string;
	impact: string;
	priority: 'High' | 'Medium' | 'Low';
}

const recommendations: Recommendation[] = [
	{
		id: 1,
		title: 'Investigate checkout payment failures',
		impact: 'Potential revenue recovery and reduced customer frustration',
		priority: 'High',
	},
	{
		id: 2,
		title: 'Create cancellation policy documentation',
		impact: 'Reduce repetitive support conversations',
		priority: 'Medium',
	},
	{
		id: 3,
		title: 'Review billing documentation',
		impact: 'Improve customer self-service success',
		priority: 'Medium',
	},
];

export function RecommendedActionsCard() {
	return (
		<div className="rounded-xl border bg-card shadow-sm">
			<div className="flex items-center gap-2 border-b px-6 py-4">
				<ListChecks className="h-5 w-5 text-primary" />

				<div>
					<h2 className="font-heading text-lg text-foreground">
						Recommended Actions
					</h2>

					<p className="text-sm text-muted-foreground">
						Prioritized improvements based on Sentinel findings
					</p>
				</div>
			</div>

			<div className="divide-y">
				{recommendations.map(recommendation => (
					<div
						key={recommendation.id}
						className="flex items-start justify-between gap-6 p-5 transition-colors hover:bg-muted/40"
					>
						<div className="flex gap-3">
							<CheckCircle2 className="mt-1 h-5 w-5 text-primary" />

							<div>
								<h3 className="font-medium">{recommendation.title}</h3>

								<p className="mt-1 text-sm text-muted-foreground">
									{recommendation.impact}
								</p>
							</div>
						</div>

						<div className="flex flex-col items-end gap-2">
							<PriorityBadge priority={recommendation.priority} />

							<button className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
								Review
								<ArrowRight className="h-4 w-4" />
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function PriorityBadge({ priority }: { priority: Recommendation['priority'] }) {
	const styles = {
		High: 'bg-destructive/10 text-destructive border-destructive/20',
		Medium: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
		Low: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
	};

	return (
		<span
			className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[priority]}`}
		>
			{priority}
		</span>
	);
}
