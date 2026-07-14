'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Flag, Sparkles, Wand2 } from 'lucide-react';

import { Button } from '@supportos/ui/components/button';

import { generateWelcomeBriefAction } from '@/lib/ai/actions';
import type { WelcomeBrief } from '@/lib/ai/types';
import { createBaselineReportAction } from '@/lib/dashboard/actions';
import {
	firstInsightHeadline,
	firstInsightRecommendedAction,
	type FirstInsightSummary,
} from '@/lib/signals/insight';

interface FirstInsightCardProps {
	summary: FirstInsightSummary;
}

type BriefState =
	| { status: 'idle' }
	| { status: 'loading' }
	| { status: 'success'; brief: WelcomeBrief }
	| { status: 'error'; message: string };

// Phase 10D/10E/10F together: shown once, between "signals exist" and
// "a report has ever been generated." The deterministic numbers and
// headline are always visible immediately (10D); the AI brief is
// opt-in on click (10F, same "code calculates, AI explains" discipline
// as every other AI card); establishing a baseline (10E) is the one
// action that moves the org into its normal, ongoing dashboard.
export function FirstInsightCard({ summary }: FirstInsightCardProps) {
	const router = useRouter();
	const [briefState, setBriefState] = useState<BriefState>({ status: 'idle' });
	const [baselineError, setBaselineError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	function handleGenerateBrief() {
		setBriefState({ status: 'loading' });
		startTransition(async () => {
			const result = await generateWelcomeBriefAction();
			if (result.ok) {
				setBriefState({ status: 'success', brief: result.brief });
			} else {
				setBriefState({ status: 'error', message: result.error });
			}
		});
	}

	function handleEstablishBaseline() {
		setBaselineError(null);
		startTransition(async () => {
			const result = await createBaselineReportAction();
			if (result.ok) {
				router.refresh();
			} else {
				setBaselineError(result.error);
			}
		});
	}

	const isLoadingBrief = isPending && briefState.status === 'loading';
	const recommendedAction = firstInsightRecommendedAction(summary);

	return (
		<div className="rounded-xl border border-primary/20 bg-card shadow-sm">
			<div className="flex items-center gap-2 border-b px-6 py-4">
				<Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
				<div>
					<h2 className="font-heading text-lg text-foreground">Your first Sentinel report is ready</h2>
					<p className="text-sm text-muted-foreground">Here&apos;s what we found in your first sync</p>
				</div>
			</div>

			<div className="p-6">
				<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					We analyzed
				</p>
				<div className="mt-2 grid grid-cols-3 gap-4 text-center sm:grid-cols-3">
					<Stat label="conversations" value={summary.conversationCount} />
					<Stat label="tickets" value={summary.ticketCount} />
					<Stat label="knowledge gaps" value={summary.knowledgeGapCount} />
				</div>

				<div className="mt-6 space-y-3 border-t pt-5">
					<div>
						<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							We found
						</p>
						<p className="mt-1 text-base leading-7 text-foreground">{firstInsightHeadline(summary)}</p>
					</div>

					{summary.topPattern && (
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Biggest opportunity
							</p>
							<p className="mt-1 text-sm font-medium text-foreground">{summary.topPattern.title}</p>
						</div>
					)}

					{recommendedAction && (
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Recommended action
							</p>
							<p className="mt-1 text-sm text-foreground">{recommendedAction}</p>
						</div>
					)}
				</div>

				<div className="mt-5 flex flex-wrap items-center gap-3">
					{briefState.status === 'idle' && (
						<Button size="sm" variant="outline" onClick={handleGenerateBrief} disabled={isPending}>
							<Wand2 className="h-3.5 w-3.5" aria-hidden="true" />
							Generate AI Welcome Brief
						</Button>
					)}

					<Button size="sm" onClick={handleEstablishBaseline} disabled={isPending}>
						<Flag className="h-3.5 w-3.5" aria-hidden="true" />
						{isPending ? 'Establishing…' : 'Establish Baseline'}
					</Button>
				</div>

				{baselineError && <p className="mt-2 text-xs text-destructive">{baselineError}</p>}

				{isLoadingBrief && (
					<div className="mt-4 space-y-3">
						<div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
						<div className="h-3 w-full animate-pulse rounded bg-muted" />
					</div>
				)}

				{briefState.status === 'error' && (
					<div className="mt-4 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
						<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
						<p className="text-sm text-foreground">{briefState.message}</p>
					</div>
				)}

				{briefState.status === 'success' && (
					<div className="mt-4 rounded-lg border bg-muted/40 p-4">
						<div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
							<Sparkles className="h-3 w-3" aria-hidden="true" />
							Welcome to Sentinel
						</div>
						<p className="mt-2 text-sm leading-6 text-foreground">{briefState.brief.summary}</p>
						<p className="mt-2 text-xs font-medium text-muted-foreground">
							Highest opportunity: {briefState.brief.highestOpportunity}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

function Stat({ label, value }: { label: string; value: number }) {
	return (
		<div>
			<div className="font-heading text-2xl text-foreground">{value}</div>
			<div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
		</div>
	);
}
