import { DashboardHeader } from '@/components/dashboard/header';
import { HealthScoreCard } from '@/components/dashboard/health-score-card';
import { MetricCard } from '@/components/dashboard/metric-card';
import { ExecutiveSummaryCard } from '@/components/dashboard/executive-summary-card';
import { CriticalFindingsCard } from '@/components/dashboard/critical-findings-card';
import { RecommendedActionsCard } from '@/components/dashboard/recommended-actions-card';
import { KnowledgeGapsMetric } from '@/components/dashboard/knowledge-gaps-metric';
import { TrendSummaryCard } from '@/components/dashboard/trend-summary-card';
import { AiExecutiveBriefCard } from '@/components/dashboard/ai-executive-brief-card';
import { ExecutiveTimelineCard } from '@/components/dashboard/executive-timeline-card';
import { RecentImprovementsCard } from '@/components/dashboard/recent-improvements-card';
import { OperationalMemoryCard } from '@/components/dashboard/operational-memory-card';
import { OperationalSignalsCard } from '@/components/dashboard/operational-signals-card';
import { ConnectedSourcesCard } from '@/components/dashboard/connected-sources-card';
import { EmergingRisksCard } from '@/components/dashboard/emerging-risks-card';
import { CustomerConversationsCard } from '@/components/dashboard/customer-conversations-card';
import { EmptyState } from '@/components/dashboard/empty-state';
import { SectionHeading } from '@/components/dashboard/section-heading';

import { Activity, AlertTriangle, Building2, ClipboardList, ShieldCheck } from 'lucide-react';

import { getCurrentMembership, getExecutiveDashboardData } from '@/lib/dashboard/dashboard';
import { getSignalsOverview, getConnectedSourcesOverview, getResolutionOverview } from '@/lib/signals/data';
import { buildConversationSummary } from '@/lib/signals/conversations';
import { buildEmergingRisks } from '@/lib/signals/risks';
import { buildResolutionMetrics } from '@/lib/signals/resolution';
import { detectEmergingTrends } from '@/lib/signals/trends';
import { getFindingProvenance } from '@/lib/signals/provenance';

// Phase 21E/v2 -- Insights: everything Sentinel's deterministic engine has
// found, one page. This is the former /dashboard content, moved here and
// retitled once /dashboard itself became the Phase 21F "Customer
// Operations Home" (a lighter landing page linking here, to Inbox, and to
// Customers). No logic changed in the move -- health score, trend,
// emerging risks, findings (with Phase 21E provenance), recommendations,
// and every "more detail" section below are unchanged from before.
export default async function InsightsPage() {
	const [data, signalsOverview, connectedSources, resolutionOverview, membership] = await Promise.all([
		getExecutiveDashboardData(),
		getSignalsOverview(),
		getConnectedSourcesOverview(),
		getResolutionOverview(),
		getCurrentMembership(),
	]);

	if (!data) {
		return (
			<>
				<DashboardHeader title="Insights" description="What Sentinel has found in your operation." />

				<div className="px-6 py-8 lg:px-8">
					<EmptyState
						icon={Building2}
						title="No organization found"
						description="Your account isn't linked to an organization yet, so there's nothing to show. Once you're part of one, its Sentinel data will appear here automatically -- ask your workspace admin to add you, or contact support if this seems wrong."
					/>
				</div>
			</>
		);
	}

	const {
		healthScore,
		executiveSummary,
		findings,
		recommendations,
		knowledgeGaps,
		trend,
		counts,
		improvementHistory,
		timeline,
		improvementEvents,
	} = data;

	const signals = signalsOverview?.signals ?? [];
	const patterns = signalsOverview?.patterns ?? [];

	const provenance = membership
		? await getFindingProvenance(membership.organizationId, findings.map(f => f.id))
		: undefined;

	const emergingRisks = buildEmergingRisks(detectEmergingTrends(signals), improvementEvents);

	if (signals.length === 0 && counts.healthReports === 0) {
		return (
			<>
				<DashboardHeader title="Insights" description="What Sentinel has found in your operation." />

				<div className="px-6 py-8 lg:px-8">
					<EmptyState
						icon={ShieldCheck}
						title="Nothing to show yet"
						description="Once you've connected a source or tried the AI Assistant, Sentinel's findings will build up here."
					/>
				</div>
			</>
		);
	}

	const isBaseline = counts.healthReports === 1;

	return (
		<>
			<DashboardHeader title="Insights" description="What Sentinel has found in your operation." />

			<div className="space-y-10 px-6 py-8 lg:px-8">
				<section className="space-y-3">
					<SectionHeading eyebrow="How are we doing?" description="Overall operations health" />
					<HealthScoreCard
						score={healthScore.score}
						previousScore={healthScore.previousScore}
						categories={healthScore.categories}
						isBaseline={isBaseline}
					/>
				</section>

				<section className="space-y-3">
					<SectionHeading eyebrow="What changed?" description="Since your last report" />
					<TrendSummaryCard trend={trend} />
				</section>

				<section className="space-y-3">
					<SectionHeading eyebrow="What is becoming a problem?" description="Increasing before it's critical" />
					<EmergingRisksCard risks={emergingRisks} />
				</section>

				<section className="space-y-3">
					<SectionHeading eyebrow="What matters most?" description="Highest-priority issue" />
					<CriticalFindingsCard
						findings={findings}
						recommendations={recommendations}
						improvementEvents={improvementEvents}
						provenance={provenance}
					/>
				</section>

				<section className="space-y-3">
					<SectionHeading eyebrow="What should we do?" description="Ranked by impact vs. effort" />
					<RecommendedActionsCard recommendations={recommendations} />
				</section>

				<section className="space-y-3">
					<SectionHeading eyebrow="What worked before?" description="Your organization's own track record" />
					<OperationalMemoryCard events={improvementEvents} />
				</section>

				<div className="border-t pt-8">
					<h2 className="mb-6 text-sm font-semibold text-foreground">More detail</h2>

					<div className="space-y-8">
						<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
							<MetricCard
								title="Critical Findings"
								value={String(counts.criticalFindings)}
								description="Require immediate attention"
								icon={AlertTriangle}
							/>

							<KnowledgeGapsMetric gaps={knowledgeGaps} />

							<MetricCard
								title="Recommended Actions"
								value={String(counts.recommendedActions)}
								description="Generated by Sentinel AI"
								icon={ClipboardList}
							/>

							<MetricCard
								title="Health Reports"
								value={String(counts.healthReports)}
								description="Generated to date"
								icon={Activity}
							/>
						</div>

						<div className="grid gap-6 lg:grid-cols-3">
							<div className="lg:col-span-2 space-y-6">
								<ExecutiveSummaryCard
									summary={executiveSummary.summary}
									keyTakeaway={executiveSummary.keyTakeaway}
									topRisks={executiveSummary.topRisks}
									potentialScoreGain={executiveSummary.potentialScoreGain}
								/>
								<AiExecutiveBriefCard />
							</div>

							<div className="space-y-6">
								<RecentImprovementsCard improvements={improvementHistory} />
								<ExecutiveTimelineCard events={timeline} />
							</div>
						</div>

						<CustomerConversationsCard
							summary={buildConversationSummary(signals, patterns)}
							resolution={resolutionOverview?.metrics ?? buildResolutionMetrics([])}
							frequentQuestions={resolutionOverview?.frequentQuestions ?? []}
						/>

						<div className="grid gap-6 lg:grid-cols-3">
							<div className="lg:col-span-2">
								<OperationalSignalsCard
									signals={signals}
									patterns={patterns}
									improvementEvents={improvementEvents}
								/>
							</div>

							<ConnectedSourcesCard sources={connectedSources ?? []} />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
