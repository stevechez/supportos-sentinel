import { ArrowRight, Sparkles } from 'lucide-react';

import { Container } from '@/components/marketing/container';
import { EmptyState } from '@/components/dashboard/empty-state';
import { getExecutiveDashboardData } from '@/lib/dashboard/dashboard';

export default async function RecommendationsPage() {
	const data = await getExecutiveDashboardData();
	const recommendations = data?.recommendations ?? [];
	const highImpactCount = recommendations.filter(r => r.impact === 'High').length;
	const quickWinCount = recommendations.filter(r => r.effort === 'Low').length;

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

						<p className="mt-2 text-3xl font-semibold">{recommendations.length}</p>
					</div>

					<div className="rounded-2xl border border-border bg-card p-5">
						<p className="text-sm text-muted-foreground">High impact</p>

						<p className="mt-2 text-3xl font-semibold">{highImpactCount}</p>
					</div>

					<div className="rounded-2xl border border-border bg-card p-5">
						<p className="text-sm text-muted-foreground">Quick wins</p>

						<p className="mt-2 text-3xl font-semibold">{quickWinCount}</p>
					</div>
				</div>

				{recommendations.length === 0 ? (
					<div className="mt-10">
						<EmptyState
							icon={Sparkles}
							title="No recommended actions yet."
							description="Sentinel turns findings into recommendations automatically -- there's nothing to act on until one is identified. Log some customer activity or connect a source to get started."
						/>
					</div>
				) : (
					<div className="mt-10 space-y-5">
						{recommendations.map(item => (
							<div
								key={item.id}
								className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand/30"
							>
								<div className="flex items-start gap-4">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-sm font-semibold text-brand">
										{item.rank}
									</div>

									<div className="flex-1">
										<div className="flex flex-col justify-between gap-2 sm:flex-row">
											<h2 className="font-medium text-foreground">
												{item.title}
											</h2>

											<span className="text-sm text-muted-foreground">
												{item.impact} impact &middot; {item.effort} effort
											</span>
										</div>

										<p className="mt-2 text-sm leading-6 text-muted-foreground">
											{item.impactDescription}
										</p>

										<button className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand">
											View recommendation
											<ArrowRight className="h-4 w-4" />
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</Container>
		</section>
	);
}
