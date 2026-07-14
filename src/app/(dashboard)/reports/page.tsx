import { AlertTriangle, Sparkles } from 'lucide-react';

import { Container } from '@/components/marketing/container';
import { EmptyState } from '@/components/dashboard/empty-state';
import { getExecutiveDashboardData } from '@/lib/dashboard/dashboard';

function healthLabel(score: number): string {
	if (score >= 85) return 'Excellent';
	if (score >= 70) return 'Good';
	if (score >= 50) return 'Needs attention';
	return 'At risk';
}

export default async function ReportsPage() {
	const data = await getExecutiveDashboardData();

	if (!data) {
		return (
			<section className="py-10">
				<Container>
					<EmptyState
						icon={AlertTriangle}
						title="No organization found"
						description="Your account isn't linked to an organization yet."
					/>
				</Container>
			</section>
		);
	}

	const { healthScore, executiveSummary, counts } = data;

	return (
		<section className="py-10">
			<Container>
				<div className="max-w-3xl">
					<p className="text-sm font-medium uppercase tracking-wide text-brand">
						Reports
					</p>

					<h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
						Your business health at a glance
					</h1>

					<p className="mt-4 text-muted-foreground">
						Sentinel turns customer activity into simple reports so you always
						understand what is happening.
					</p>
				</div>

				<div className="mt-10 grid gap-4 md:grid-cols-3">
					<div className="rounded-2xl border border-border bg-card p-6">
						<p className="text-sm text-muted-foreground">Business Health</p>

						<p className="mt-3 text-4xl font-semibold">{healthScore.score}</p>

						<p className="mt-2 text-sm text-brand">{healthLabel(healthScore.score)}</p>
					</div>

					<div className="rounded-2xl border border-border bg-card p-6">
						<p className="text-sm text-muted-foreground">Open Findings</p>

						<p className="mt-3 text-4xl font-semibold">{counts.criticalFindings}</p>

						<p className="mt-2 text-sm text-muted-foreground">Currently unresolved</p>
					</div>

					<div className="rounded-2xl border border-border bg-card p-6">
						<p className="text-sm text-muted-foreground">Recommended Actions</p>

						<p className="mt-3 text-4xl font-semibold">{counts.recommendedActions}</p>

						<p className="mt-2 text-sm text-muted-foreground">Ready to work on</p>
					</div>
				</div>

				<div className="mt-10 rounded-2xl border border-border bg-card p-8">
					<h2 className="text-xl font-semibold text-foreground">
						Weekly Business Health Report
					</h2>

					<p className="mt-3 text-sm leading-7 text-muted-foreground">
						{executiveSummary.summary}
					</p>
				</div>

				{executiveSummary.topRisks.length === 0 ? (
					<div className="mt-8">
						<EmptyState
							icon={Sparkles}
							title="Excellent."
							description="No critical operational risks detected."
						/>
					</div>
				) : (
					<div className="mt-8 space-y-5">
						<h2 className="text-xl font-semibold text-foreground">
							Key insights
						</h2>

						{executiveSummary.topRisks.map((risk, index) => (
							<div
								key={risk}
								className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand/30"
							>
								<div className="flex gap-4">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-sm font-semibold text-brand">
										{index + 1}
									</div>

									<div>
										<h3 className="font-medium text-foreground">{risk}</h3>
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
