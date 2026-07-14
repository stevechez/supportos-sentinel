import { AlertCircle, BookOpen, CheckCircle2 } from 'lucide-react';

import { Container } from '@/components/marketing/container';
import { EmptyState } from '@/components/dashboard/empty-state';
import { getExecutiveDashboardData } from '@/lib/dashboard/dashboard';

export default async function KnowledgeGapsPage() {
	const data = await getExecutiveDashboardData();
	const gaps = data?.knowledgeGaps ?? [];
	const withPlan = gaps.filter(g => g.hasDocumentationPlan).length;
	const withoutPlan = gaps.length - withPlan;

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

						<p className="mt-2 text-3xl font-semibold">{gaps.length}</p>
					</div>

					<div className="rounded-2xl border border-border bg-card p-5">
						<p className="text-sm text-muted-foreground">Documentation planned</p>

						<p className="mt-2 text-3xl font-semibold">{withPlan}</p>
					</div>

					<div className="rounded-2xl border border-border bg-card p-5">
						<p className="text-sm text-muted-foreground">Not yet documented</p>

						<p className="mt-2 text-3xl font-semibold">{withoutPlan}</p>
					</div>
				</div>

				{gaps.length === 0 ? (
					<div className="mt-10">
						<EmptyState
							icon={BookOpen}
							title="No knowledge gaps yet."
							description="Sentinel hasn't noticed any undocumented questions -- that's a good sign for your documentation. As more conversations and tickets come in, any gaps will show up here automatically."
						/>
					</div>
				) : (
					<div className="mt-10 space-y-5">
						<h2 className="text-xl font-semibold text-foreground">
							Customer questions Sentinel noticed
						</h2>

						{gaps.map(gap => {
							const Icon = gap.hasDocumentationPlan ? CheckCircle2 : AlertCircle;

							return (
								<div
									key={gap.id}
									className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand/30"
								>
									<div className="flex items-start gap-4">
										<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
											<Icon className="h-5 w-5 text-brand" />
										</div>

										<div>
											<h3 className="font-medium text-foreground">{gap.question}</h3>

											<p className="mt-2 text-sm leading-6 text-muted-foreground">
												Asked {gap.occurrenceCount} time{gap.occurrenceCount === 1 ? '' : 's'}.{' '}
												{gap.hasDocumentationPlan
													? `Documentation planned: ${gap.recommendedDocument}.`
													: 'No documentation identified yet.'}
											</p>

											<p className="mt-4 text-xs font-medium uppercase tracking-wide text-brand">
												{gap.hasDocumentationPlan ? 'Documentation planned' : 'High priority'}
											</p>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</Container>
		</section>
	);
}
