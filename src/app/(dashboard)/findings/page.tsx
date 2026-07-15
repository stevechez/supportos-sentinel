import { AlertTriangle, Info, ShieldCheck, MessagesSquare } from 'lucide-react';

import { Container } from '@/components/marketing/container';
import { EmptyState } from '@/components/dashboard/empty-state';
import { getCurrentMembership, getExecutiveDashboardData } from '@/lib/dashboard/dashboard';
import type { Finding } from '@/lib/dashboard/dashboard';
import { getFindingProvenance, type FindingProvenance } from '@/lib/signals/provenance';

function severityIcon(severity: Finding['severity']) {
	if (severity === 'Critical' || severity === 'High') {
		return AlertTriangle;
	}
	return Info;
}

export default async function FindingsPage() {
	const [data, membership] = await Promise.all([getExecutiveDashboardData(), getCurrentMembership()]);
	const findings = data?.findings ?? [];

	// Phase 21E: provenance answers "where did this come from" for every
	// finding shown below -- which real conversations produced the signals
	// that became this finding. Batch-loaded once for the whole list rather
	// than per-row, same pattern as everything else on this page.
	const provenance: Map<string, FindingProvenance> = membership
		? await getFindingProvenance(membership.organizationId, findings.map(f => f.id))
		: new Map();

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
							description="Sentinel hasn't detected any operational risks in your customer activity. Keep connecting sources and logging activity to improve visibility as your data grows."
						/>
					</div>
				) : (
					<div className="mt-10 space-y-5">
						{findings.map(finding => {
							const Icon = severityIcon(finding.severity);
							const source = provenance.get(finding.id);

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

											{source && source.tickets.length > 0 && (
												<div className="mt-4 border-t pt-4">
													<p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
														<MessagesSquare className="h-3.5 w-3.5" aria-hidden="true" />
														Where this came from
													</p>

													<p className="mt-1.5 text-xs text-muted-foreground">
														Built from {source.signalCount} signal{source.signalCount === 1 ? '' : 's'} across these conversations:
													</p>

													<ul className="mt-2 space-y-1">
														{source.tickets.map(ticket => (
															<li key={ticket.id} className="text-sm text-foreground">
																&ldquo;{ticket.subject}&rdquo;
															</li>
														))}
													</ul>
												</div>
											)}
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
