'use client';

import { useState, useTransition } from 'react';
import { Sparkles, TrendingUp, Wand2 } from 'lucide-react';

import { Button } from '@supportos/ui/components/button';

import { EmptyState } from './empty-state';

import { explainEmergingRiskAction } from '@/lib/ai/actions';
import type { EmergingRiskExplanation } from '@/lib/ai/types';
import type { EmergingRisk } from '@/lib/signals/risks';

interface EmergingRisksCardProps {
	risks: EmergingRisk[];
}

// Phase 14C: "Emerging Risks." Calm, evidence-based tone by design -- this
// is an early warning, not an alarm. Every number shown here is something
// that already happened (a real count of recent signals); nothing on this
// card is a forecast.
export function EmergingRisksCard({ risks }: EmergingRisksCardProps) {
	return (
		<div className="rounded-xl border bg-card shadow-sm">
			<div className="flex items-center gap-2 border-b px-6 py-4">
				<TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
				<div>
					<h2 className="font-heading text-lg text-foreground">Emerging Risks</h2>
					<p className="text-sm text-muted-foreground">
						Issues that are increasing before they become critical
					</p>
				</div>
			</div>

			{risks.length === 0 ? (
				<EmptyState
					icon={TrendingUp}
					title="Nothing accelerating right now."
					description="Sentinel compares this week's activity to recent weeks continuously. If an issue starts increasing faster than normal, it will show up here early -- before it becomes a critical finding."
				/>
			) : (
				<div className="divide-y">
					{risks.map(risk => (
						<RiskRow key={risk.title} risk={risk} />
					))}
				</div>
			)}
		</div>
	);
}

type ExplainState =
	| { status: 'idle' }
	| { status: 'loading' }
	| { status: 'success'; explanation: EmergingRiskExplanation }
	| { status: 'error'; message: string };

const SEVERITY_STYLES: Record<EmergingRisk['severity'], string> = {
	high: 'bg-destructive/10 text-destructive border-destructive/20',
	medium: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
	low: 'bg-muted text-muted-foreground border-transparent',
};

function RiskRow({ risk }: { risk: EmergingRisk }) {
	const [explainState, setExplainState] = useState<ExplainState>({ status: 'idle' });
	const [isPending, startTransition] = useTransition();

	function handleExplain() {
		setExplainState({ status: 'loading' });
		startTransition(async () => {
			const result = await explainEmergingRiskAction(risk.title);
			if (result.ok) {
				setExplainState({ status: 'success', explanation: result.explanation });
			} else {
				setExplainState({ status: 'error', message: result.error });
			}
		});
	}

	return (
		<div className="p-5">
			<div className="flex items-start justify-between gap-4">
				<div>
					<div className="flex items-center gap-2">
						<TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
						<h3 className="font-medium leading-6 text-foreground">{risk.title}</h3>
					</div>

					<ul className="mt-2 space-y-1">
						{risk.evidence.map(item => (
							<li key={item} className="text-sm text-muted-foreground">
								{item}
							</li>
						))}
					</ul>

					<p className="mt-3 text-sm text-foreground">
						<span className="font-medium">Recommended: </span>
						{risk.recommendedAction}
					</p>
				</div>

				<span
					className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${SEVERITY_STYLES[risk.severity]}`}
				>
					{risk.severity}
				</span>
			</div>

			<div className="mt-4 flex items-center gap-4">
				<TrendTimeline periodCounts={risk.periodCounts} />

				{explainState.status === 'idle' && (
					<Button size="xs" variant="ghost" onClick={handleExplain} disabled={isPending}>
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
				<div className="mt-3 rounded-lg border bg-muted/40 p-3">
					<div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
						<Sparkles className="h-3 w-3" aria-hidden="true" />
						AI Explanation
					</div>
					<p className="mt-1.5 text-sm text-foreground">{explainState.explanation.explanation}</p>
				</div>
			)}
		</div>
	);
}

/**
 * Phase 14D: the simplest possible trend visualization -- a handful of
 * bars, one per week, height proportional to that week's count. No
 * charting library, no axes, no tooltips -- just enough to make "this is
 * accelerating" visible at a glance.
 */
function TrendTimeline({ periodCounts }: { periodCounts: number[] }) {
	const max = Math.max(1, ...periodCounts);

	return (
		<div className="flex items-end gap-1.5" aria-hidden="true">
			{periodCounts.map((count, index) => (
				<div
					key={index}
					className="w-3 rounded-sm bg-primary/60"
					style={{ height: `${Math.max(4, (count / max) * 28)}px` }}
					title={`${count}`}
				/>
			))}
			<span className="sr-only">
				Weekly counts: {periodCounts.join(', then ')}
			</span>
		</div>
	);
}
