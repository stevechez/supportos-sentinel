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
import { OnboardingBanner } from '@/components/dashboard/onboarding-banner';
import { FirstInsightCard } from '@/components/dashboard/first-insight-card';
import { CustomerConversationsCard } from '@/components/dashboard/customer-conversations-card';
import { EmergingRisksCard } from '@/components/dashboard/emerging-risks-card';
import { EmptyState } from '@/components/dashboard/empty-state';
import { SectionHeading } from '@/components/dashboard/section-heading';

import { Activity, AlertTriangle, Building2, ClipboardList } from 'lucide-react';

import { getExecutiveDashboardData } from '@/lib/dashboard/dashboard';
import { getSignalsOverview, getConnectedSourcesOverview, getResolutionOverview } from '@/lib/signals/data';
import { buildConversationSummary } from '@/lib/signals/conversations';
import { buildFirstInsightSummary } from '@/lib/signals/insight';
import { buildEmergingRisks } from '@/lib/signals/risks';
import { buildResolutionMetrics } from '@/lib/signals/resolution';
import { detectEmergingTrends } from '@/lib/signals/trends';

export default async function DashboardPage() {
	const [data, signalsOverview, connectedSources, resolutionOverview] = await Promise.all([
		getExecutiveDashboardData(),
		getSignalsOverview(),
		getConnectedSourcesOverview(),
		getResolutionOverview(),
	]);

	if (!data) {
		return (
			<>
				<DashboardHeader
					title="Sentinel"
					description="Your operation at a glance."
				/>

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
	// Phase 14: Signals -> trend engine -> EmergingRisk. Deterministic, no AI --
	// computed fresh on every render from the same signals/improvementEvents
	// already loaded for the rest of the page, never a separate fetch.
	const emergingRisks = buildEmergingRisks(detectEmergingTrends(signals), improvementEvents);

	// Phase 10C: a genuinely brand-new org (never synced anything, never had
	// a report) gets a calm, single next step instead of a wall of zeroes.
	if (signals.length === 0 && counts.healthReports === 0) {
		return (
			<>
				<DashboardHeader
					title="Sentinel"
					description="Your operation at a glance."
				/>

				<div className="space-y-8 px-6 py-8 lg:px-8">
					<OnboardingBanner />
					<ConnectedSourcesCard sources={connectedSources ?? []} />
				</div>
			</>
		);
	}

	// Phase 10D/E/F: signals exist but Sentinel has never produced a report
	// yet -- the "first insight" moment, before the org has a baseline.
	const showFirstInsight = counts.healthReports === 0;
	const isBaseline = counts.healthReports === 1;

	return (
		<>
			<DashboardHeader
				title="Sentinel"
				description="Your operation at a glance."
			/>

			<div className="space-y-10 px-6 py-8 lg:px-8">
				{showFirstInsight && <FirstInsightCard summary={buildFirstInsightSummary(signals, patterns)} />}

				{/*
					Phase 13A: five priority sections, each answering one question an
					executive actually asks, in the order they'd ask it. Same
					components and data as before -- this is hierarchy and framing,
					not new logic. Full detail (KPIs, full lists, raw signals) lives
					below as supporting depth once the headline is understood.
				*/}
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
						{/* KPI Cards */}
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

						{/* Executive Summary + AI Brief */}
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

						{/* Customer Conversations (Phase 11F), extended with the resolution loop (Phase 15C/D) */}
						<CustomerConversationsCard
							summary={buildConversationSummary(signals, patterns)}
							resolution={resolutionOverview?.metrics ?? buildResolutionMetrics([])}
							frequentQuestions={resolutionOverview?.frequentQuestions ?? []}
						/>

						{/* Operational Signals (Phase 8) + Connected Sources (Phase 9) */}
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
