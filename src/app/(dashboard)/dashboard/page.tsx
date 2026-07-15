import Link from 'next/link';
import { ArrowRight, Bot, Building2, Inbox, ListChecks, MessageCircle, Users } from 'lucide-react';

import { DashboardHeader } from '@/components/dashboard/header';
import { EmptyState } from '@/components/dashboard/empty-state';
import { OnboardingBanner } from '@/components/dashboard/onboarding-banner';
import { ConnectedSourcesCard } from '@/components/dashboard/connected-sources-card';
import { FirstInsightCard } from '@/components/dashboard/first-insight-card';
import { ExecutiveOperationsCard } from '@/components/dashboard/executive-operations-card';

import { getExecutiveDashboardData } from '@/lib/dashboard/dashboard';
import { getSignalsOverview, getConnectedSourcesOverview, getResolutionOverview } from '@/lib/signals/data';
import { buildFirstInsightSummary } from '@/lib/signals/insight';
import { getRecentConversations, CONVERSATION_OUTCOME_LABELS } from '@/lib/signals/conversation-list';

// Phase 21F -- Customer Operations Home. Replaces the "analytics
// dashboard" landing feeling with the four questions the handoff names:
// what happened today, how AI is helping, what needs attention, how can
// we improve. Deliberately lighter than the old /dashboard content, which
// moved to /dashboard/insights (Phase 21E/v2) -- this page is a summary
// and a set of doors into Inbox / Customers / AI Assistant / Insights,
// not the deep-dive itself.
export default async function DashboardHomePage() {
	const [data, signalsOverview, connectedSources, resolutionOverview, recentConversations] = await Promise.all([
		getExecutiveDashboardData(),
		getSignalsOverview(),
		getConnectedSourcesOverview(),
		getResolutionOverview(),
		getRecentConversations(),
	]);

	if (!data) {
		return (
			<>
				<DashboardHeader title="Customer Operations" description="Your operation at a glance." />
				<div className="px-6 py-8 lg:px-8">
					<EmptyState
						icon={Building2}
						title="No organization found"
						description="Your account isn't linked to an organization yet -- ask your workspace admin to add you, or contact support if this seems wrong."
					/>
				</div>
			</>
		);
	}

	const { healthScore, findings, counts } = data;
	const signals = signalsOverview?.signals ?? [];
	const patterns = signalsOverview?.patterns ?? [];

	if (signals.length === 0 && counts.healthReports === 0) {
		return (
			<>
				<DashboardHeader title="Customer Operations" description="Your operation at a glance." />
				<div className="space-y-8 px-6 py-8 lg:px-8">
					<OnboardingBanner />
					<ConnectedSourcesCard sources={connectedSources ?? []} />
				</div>
			</>
		);
	}

	const showFirstInsight = counts.healthReports === 0;
	const topFinding = findings[0] ?? null;
	const recentConversationPreview = (recentConversations ?? []).slice(0, 3);

	return (
		<>
			<DashboardHeader title="Customer Operations" description="Your operation at a glance." />

			<div className="space-y-8 px-6 py-8 lg:px-8">
				{showFirstInsight && <FirstInsightCard summary={buildFirstInsightSummary(signals, patterns)} />}

				<ExecutiveOperationsCard
					summary={{
						aiHandledCount: resolutionOverview?.metrics.aiResolvedCount ?? 0,
						escalatedCount: resolutionOverview?.metrics.humanEscalatedCount ?? 0,
						patternsDetected: patterns.length,
						recommendedImprovements: counts.recommendedActions,
						healthScore: healthScore.score,
					}}
				/>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<QuickLink href="/dashboard/inbox" icon={Inbox} title="Inbox" description="Recent conversations" />
					<QuickLink href="/dashboard/customers" icon={Users} title="Customers" description="Who you're helping" />
					<QuickLink href="/dashboard/assistant" icon={Bot} title="AI Assistant" description="Try answering a question" />
					<QuickLink href="/dashboard/insights" icon={ListChecks} title="Insights" description="Findings & recommendations" />
				</div>

				<div className="grid gap-6 lg:grid-cols-2">
					<div className="rounded-2xl border border-border bg-card p-6">
						<h2 className="font-heading text-lg text-foreground">What needs attention</h2>
						<p className="mt-1 text-sm text-muted-foreground">Your highest-priority finding right now</p>

						{topFinding ? (
							<div className="mt-4 rounded-xl border border-border p-4">
								<p className="font-medium text-foreground">{topFinding.title}</p>
								<p className="mt-1 text-sm text-muted-foreground">
									{topFinding.businessImpact ?? 'Sentinel is still assessing the business impact of this finding.'}
								</p>
							</div>
						) : (
							<p className="mt-4 text-sm text-muted-foreground">Nothing needs attention right now.</p>
						)}

						<Link
							href="/dashboard/insights"
							className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
						>
							See all insights
							<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
						</Link>
					</div>

					<div className="rounded-2xl border border-border bg-card p-6">
						<h2 className="font-heading text-lg text-foreground">Recent conversations</h2>
						<p className="mt-1 text-sm text-muted-foreground">What&rsquo;s been happening lately</p>

						{recentConversationPreview.length > 0 ? (
							<ul className="mt-4 space-y-3">
								{recentConversationPreview.map(conversation => (
									<li key={conversation.id} className="flex items-center justify-between gap-3">
										<div className="flex items-center gap-2 text-sm text-foreground">
											<MessageCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
											<span className="line-clamp-1">{conversation.subject}</span>
										</div>
										<span className="shrink-0 text-xs text-muted-foreground">
											{CONVERSATION_OUTCOME_LABELS[conversation.outcome]}
										</span>
									</li>
								))}
							</ul>
						) : (
							<p className="mt-4 text-sm text-muted-foreground">No conversations yet.</p>
						)}

						<Link
							href="/dashboard/inbox"
							className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
						>
							Go to Inbox
							<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
						</Link>
					</div>
				</div>
			</div>
		</>
	);
}

function QuickLink({
	href,
	icon: Icon,
	title,
	description,
}: {
	href: string;
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	title: string;
	description: string;
}) {
	return (
		<Link
			href={href}
			className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-brand/30"
		>
			<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10">
				<Icon className="h-4 w-4 text-brand" aria-hidden="true" />
			</div>
			<div>
				<p className="text-sm font-medium text-foreground">{title}</p>
				<p className="text-xs text-muted-foreground">{description}</p>
			</div>
		</Link>
	);
}
