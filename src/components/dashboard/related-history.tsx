'use client';

import { useState, useTransition } from 'react';
import { History, Sparkles, Wand2 } from 'lucide-react';

import { Button } from '@supportos/ui/components/button';

import { explainHistoricalMatchAction } from '@/lib/ai/actions';
import type { HistoricalAdvice } from '@/lib/ai/types';
import { findSimilarPastResolutions, type ImprovementEvent } from '@/lib/dashboard/memory';

interface RelatedHistoryProps {
	/** The open finding's or detected pattern's title -- never a client-guessed match. */
	candidateTitle: string;
	/** The org's already-loaded improvement history (Phase 12A/C) -- matching happens client-side, deterministically, over data the server already sent down. */
	events: ImprovementEvent[];
}

type ExplainState =
	| { status: 'idle' }
	| { status: 'loading' }
	| { status: 'success'; advice: HistoricalAdvice }
	| { status: 'error'; message: string };

/**
 * Phase 12B/E: "Sentinel remembers..." -- a deterministic note (word-overlap
 * match already computed by src/lib/dashboard/memory.ts) plus an opt-in AI
 * "Explain" button (Phase 12F). The match itself is never up to the AI; the
 * button only ever asks it to explain the single best match this component
 * already found.
 */
export function RelatedHistory({ candidateTitle, events }: RelatedHistoryProps) {
	const [explainState, setExplainState] = useState<ExplainState>({ status: 'idle' });
	const [isPending, startTransition] = useTransition();

	const matches = findSimilarPastResolutions(candidateTitle, events);
	if (matches.length === 0) {
		return null;
	}

	const best = matches[0];

	function handleExplain() {
		setExplainState({ status: 'loading' });
		startTransition(async () => {
			const result = await explainHistoricalMatchAction(candidateTitle);
			if (result.ok) {
				setExplainState({ status: 'success', advice: result.advice });
			} else {
				setExplainState({ status: 'error', message: result.error });
			}
		});
	}

	return (
		<div className="mt-3 rounded-lg border bg-muted/30 p-3">
			<div className="flex items-start justify-between gap-3">
				<div className="flex items-start gap-2">
					<History className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
					<p className="text-xs text-foreground">
						Sentinel remembers a similar issue: <span className="font-medium">{best.event.problemTitle}</span>.
						Previous action: {best.event.actionTaken}. {best.event.impactSummary}
					</p>
				</div>

				{explainState.status === 'idle' && (
					<Button size="xs" variant="ghost" onClick={handleExplain} disabled={isPending} className="shrink-0">
						<Wand2 className="h-3 w-3" aria-hidden="true" />
						Explain
					</Button>
				)}
			</div>

			{explainState.status === 'loading' && (
				<p className="mt-2 text-xs text-muted-foreground">Asking Sentinel&apos;s advisor…</p>
			)}

			{explainState.status === 'error' && (
				<div className="mt-2 flex items-center gap-2">
					<p className="text-xs text-destructive">{explainState.message}</p>
					<Button size="xs" variant="ghost" onClick={handleExplain}>
						Try again
					</Button>
				</div>
			)}

			{explainState.status === 'success' && (
				<div className="mt-3 rounded-lg border bg-card p-3">
					<div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
						<Sparkles className="h-3 w-3" aria-hidden="true" />
						AI Explanation
					</div>
					<p className="mt-1.5 text-sm text-foreground">{explainState.advice.explanation}</p>
				</div>
			)}
		</div>
	);
}
