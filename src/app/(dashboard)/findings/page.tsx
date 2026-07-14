import { AlertTriangle, Info, ShieldCheck } from 'lucide-react';

import { Container } from '@/components/marketing/container';
import { EmptyState } from '@/components/dashboard/empty-state';
import { getExecutiveDashboardData } from '@/lib/dashboard/dashboard';
import type { Finding } from '@/lib/dashboard/dashboard';

function severityIcon(severity: Finding['severity']) {
	if (severity === 'Critical' || severity === 'High') {
		return AlertTriangle;
	}
	return Info;
}

export default async function FindingsPage() {
	const data = await getExecutiveDashboardData();
	const findings = data?.findings ?? [];

	return (
		<section className="py-10">
			<Container>
				<div className="max-w-3xl">
					<p className="text-sm font-medium uppercase tracking-wide text-brand">
						Findings
					</p>

					<h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
						What Sentinel noticed
					</h1>

					<p className="mt-4 text-muted-foreground">
						Sentinel monitors your customer conversations and highlights
						important things that may need your attention.
					</p>
				</div>

				{findings.length === 0 ? (
					<div className="mt-10">
						<EmptyState
							icon={ShieldCheck}
							title="Excellent."
							description="No critical operational risks detected."
						/>
					</div>
				) : (
					<div className="mt-10 space-y-5">
						{findings.map(finding => {
							const Icon = severityIcon(finding.severity);

							return (
								<div
									key={finding.id}
									className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand/30"
								>
									<div className="flex items-start gap-4">
										<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
											<Icon className="h-5 w-5 text-brand" />
										</div>

										<div className="flex-1">
											<div className="flex flex-col justify-between gap-2 sm:flex-row">
												<h2 className="font-medium text-foreground">
													{finding.title}
												</h2>

												<span className="text-sm text-muted-foreground">
													{finding.severity}
												</span>
											</div>

											<p className="mt-2 text-sm leading-6 text-muted-foreground">
												{finding.businessImpact ?? 'Sentinel is still assessing the business impact of this finding.'}
											</p>

											<p className="mt-4 text-xs font-medium uppercase tracking-wide text-brand">
												{finding.isTopPriority ? 'Needs attention' : 'Monitoring'}
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
