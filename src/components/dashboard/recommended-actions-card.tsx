import { ArrowRight, CheckCircle2, ListChecks, Sparkles } from 'lucide-react';

import { EmptyState } from './empty-state';

import type { Recommendation } from '@/lib/dashboard/dashboard';

interface RecommendedActionsCardProps {
	recommendations: Recommendation[];
}

export function RecommendedActionsCard({ recommendations }: RecommendedActionsCardProps) {
	return (
		<div className="rounded-xl border bg-card shadow-sm">
			<div className="flex items-center gap-2 border-b px-6 py-4">
				<ListChecks className="h-5 w-5 text-primary" aria-hidden="true" />

				<div>
					<h2 className="font-heading text-lg text-foreground">
						Recommended Actions
					</h2>

					<p className="text-sm text-muted-foreground">
						Prioritized improvements based on Sentinel findings
					</p>
				</div>
			</div>

			{recommendations.length === 0 ? (
				<EmptyState
					icon={Sparkles}
					title="No recommendations yet"
					description="Once Sentinel spots an opportunity to improve, prioritized suggestions will show up here."
				/>
			) : (
				<div className="divide-y">
					{recommendations.map(recommendation => (
						<div
							key={recommendation.id}
							className="flex flex-col gap-4 p-5 transition-colors hover:bg-muted/40 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
						>
							<div className="flex gap-3">
								<CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />

								<div>
									<h3 className="font-medium">{recommendation.title}</h3>

									<p className="mt-1 text-sm text-muted-foreground">
										{recommendation.impact}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
								<PriorityBadge priority={recommendation.priority} />

								<button
									type="button"
									className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
								>
									Review
									<span className="sr-only">{recommendation.title}</span>
									<ArrowRight className="h-4 w-4" aria-hidden="true" />
								</button>
							</div>
						</div>
					))}
				</div>
			)}
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
