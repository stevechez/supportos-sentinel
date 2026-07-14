'use client';

import { useState, useTransition } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus, Sparkles, TrendingUp, Wand2 } from 'lucide-react';

import { EmptyState } from './empty-state';
import { Button } from '@supportos/ui/components/button';

import { generateImprovementExplanationAction } from '@/lib/ai/actions';
import type { ImprovementExplanation } from '@/lib/ai/types';
import type { ImprovementRecord } from '@/lib/dashboard/dashboard';

interface RecentImprovementsCardProps {
	improvements: ImprovementRecord[];
}

// Phase 7C + 7D together: the before/after health score is entirely
// deterministic (improvement.ts), computed once on the server and passed
// down as plain props. The AI is only ever invoked on click, per action,
// to explain a result that's already on the screen -- never to produce the
// numbers themselves.
export function RecentImprovementsCard({ improvements }: RecentImprovementsCardProps) {
	if (improvements.length === 0) {
		return (
			<div className="rounded-xl border bg-card shadow-sm">
				<CardHeader />
				<EmptyState
					icon={TrendingUp}
					title="No completed actions yet."
					description="Once you mark a recommendation complete, its measured effect on your health score will show up here."
				/>
			</div>
		);
	}

	return (
		<div className="rounded-xl border bg-card shadow-sm">
			<CardHeader />
			<div className="divide-y">
				{improvements.slice(0, 5).map(record => (
					<ImprovementRow key={record.recommendationId} record={record} />
				))}
			</div>
		</div>
	);
}

function CardHeader() {
	return (
		<div className="flex items-center gap-2 border-b px-6 py-4">
			<TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
			<div>
				<h2 className="font-heading text-lg text-foreground">Recent Improvements</h2>
				<p className="text-sm text-muted-foreground">
					Measured before/after health score for completed actions
				</p>
			</div>
		</div>
	);
}

type ExplainState =
	| { status: 'idle' }
	| { status: 'loading' }
	| { status: 'success'; explanation: ImprovementExplanation }
	| { status: 'error'; message: string };

function ImprovementRow({ record }: { record: ImprovementRecord }) {
	const [state, setState] = useState<ExplainState>({ status: 'idle' });
	const [isPending, startTransition] = useTransition();

	const delta = record.delta;
	const trendIcon = delta === null || delta === 0 ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight;
	const trendClass =
		delta === null || delta === 0
			? 'text-muted-foreground'
			: delta > 0
				? 'text-emerald-400'
				: 'text-destructive';
	const TrendIcon = trendIcon;

	function handleExplain() {
		setState({ status: 'loading' });
		startTransition(async () => {
			const result = await generateImprovementExplanationAction(record.recommendationId);
			if (result.ok) {
				setState({ status: 'success', explanation: result.explanation });
			} else {
				setState({ status: 'error', message: result.error });
			}
		});
	}

	return (
		<div className="p-5">
			<div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
				<div>
					<h3 className="font-medium text-foreground">{record.recommendationTitle}</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						Completed {new Date(record.completedAt).toLocaleDateString()}
					</p>
				</div>

				<div className="flex items-center gap-4">
					<div className="text-sm text-foreground">
						{record.healthScoreBefore ?? '—'} &rarr; {record.healthScoreAfter}
					</div>

					<span className={`flex items-center gap-0.5 text-sm font-medium ${trendClass}`}>
						<TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
						{delta === null ? 'Not yet measured' : `${delta > 0 ? '+' : ''}${delta}`}
					</span>
				</div>
			</div>

			{!record.measuredByReport && (
				<p className="mt-2 text-xs text-muted-foreground">
					Based on your current live score -- a future report will confirm this.
				</p>
			)}

			<div className="mt-3">
				{state.status === 'idle' && (
					<Button size="xs" variant="outline" onClick={handleExplain} disabled={isPending}>
						<Wand2 className="h-3 w-3" aria-hidden="true" />
						Explain this result
					</Button>
				)}

				{(state.status === 'loading' || isPending) && (
					<p className="text-xs text-muted-foreground">Asking Sentinel&apos;s advisor…</p>
				)}

				{state.status === 'error' && (
					<div className="flex items-center gap-2">
						<p className="text-xs text-destructive">{state.message}</p>
						<Button size="xs" variant="ghost" onClick={handleExplain}>
							Try again
						</Button>
					</div>
				)}

				{state.status === 'success' && (
					<div className="rounded-lg border bg-muted/40 p-3">
						<div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
							<Sparkles className="h-3 w-3" aria-hidden="true" />
							AI Explanation
						</div>
						<p className="mt-1.5 text-sm text-foreground">{state.explanation.summary}</p>
						<p className="mt-1 text-xs font-medium text-muted-foreground">
							Estimated impact: {state.explanation.estimatedImpact}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
