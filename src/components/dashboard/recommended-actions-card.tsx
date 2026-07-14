'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, ListChecks, Sparkles } from 'lucide-react';

import { EmptyState } from './empty-state';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from '@supportos/ui/components/sheet';
import { Button } from '@supportos/ui/components/button';

import { updateRecommendationStatusAction } from '@/lib/dashboard/actions';
import { RECOMMENDATION_STATUS_LABELS, RECOMMENDATION_STATUS_ORDER } from '@/lib/dashboard/improvement';
import type { Recommendation } from '@/lib/dashboard/dashboard';

interface RecommendedActionsCardProps {
	recommendations: Recommendation[];
}

const INLINE_LIMIT = 3;

export function RecommendedActionsCard({ recommendations }: RecommendedActionsCardProps) {
	const [open, setOpen] = useState(false);
	const visible = recommendations.slice(0, INLINE_LIMIT);
	const remaining = recommendations.length - visible.length;

	return (
		<div className="rounded-xl border bg-card shadow-sm">
			<div className="flex items-center gap-2 border-b px-6 py-4">
				<ListChecks className="h-5 w-5 text-primary" aria-hidden="true" />

				<div>
					<h2 className="font-heading text-lg text-foreground">
						Recommended Actions
					</h2>

					<p className="text-sm text-muted-foreground">
						Ranked action plan based on impact vs. effort
					</p>
				</div>
			</div>

			{recommendations.length === 0 ? (
				<EmptyState
					icon={Sparkles}
					title="No recommended actions yet."
					description="Sentinel will generate recommendations as findings are identified."
				/>
			) : (
				<>
					<div className="divide-y">
						{visible.map(recommendation => (
							<RecommendationRow key={recommendation.id} recommendation={recommendation} />
						))}
					</div>

					{remaining > 0 && (
						<div className="border-t p-3 text-center">
							<Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
								View all {recommendations.length} recommendations
							</Button>
						</div>
					)}
				</>
			)}

			<Sheet open={open} onOpenChange={setOpen}>
				<SheetContent className="flex flex-col gap-0 overflow-y-auto bg-card p-0">
					<SheetHeader className="border-b px-6 py-5">
						<SheetTitle className="font-heading text-lg">
							Action Plan ({recommendations.length})
						</SheetTitle>

						<p className="text-xs text-muted-foreground">
							Ranked by impact, then by effort
						</p>
					</SheetHeader>

					<div className="divide-y">
						{recommendations.map(recommendation => (
							<RecommendationRow key={recommendation.id} recommendation={recommendation} detailed />
						))}
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}

function RecommendationRow({
	recommendation,
	detailed = false,
}: {
	recommendation: Recommendation;
	detailed?: boolean;
}) {
	return (
		<div
			className="flex flex-col gap-4 p-5 transition-colors hover:bg-muted/40 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
		>
			<div className="flex gap-3">
				<CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />

				<div>
					<h3 className="font-medium">
						<span className="mr-1.5 text-muted-foreground">{recommendation.rank}.</span>
						{recommendation.title}
					</h3>

					<p className="mt-1 text-sm text-muted-foreground">
						{recommendation.impactDescription}
					</p>

					{detailed && (
						<div className="mt-4 border-t pt-4">
							<StatusControl recommendationId={recommendation.id} status={recommendation.status} />
						</div>
					)}
				</div>
			</div>

			<div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-2">
				<div className="flex items-center gap-1.5">
					<ImpactBadge impact={recommendation.impact} />
					<EffortBadge effort={recommendation.effort} />
				</div>

				{!detailed && (
					<button
						type="button"
						className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
					>
						Review
						<span className="sr-only">{recommendation.title}</span>
						<ArrowRight className="h-4 w-4" aria-hidden="true" />
					</button>
				)}
			</div>
		</div>
	);
}

/**
 * Advances a recommendation one step through the lifecycle (Not Started ->
 * In Progress -> Completed). Same single "next step" button pattern as the
 * finding lifecycle control -- a simple forward chain, not a task app.
 */
function StatusControl({ recommendationId, status }: { recommendationId: string; status: string }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	const currentIndex = RECOMMENDATION_STATUS_ORDER.indexOf(
		status as (typeof RECOMMENDATION_STATUS_ORDER)[number],
	);
	const nextStatus = currentIndex >= 0 ? RECOMMENDATION_STATUS_ORDER[currentIndex + 1] : undefined;
	const isCompleted = status === 'completed';

	function handleAdvance() {
		if (!nextStatus) {
			return;
		}
		setError(null);
		startTransition(async () => {
			const result = await updateRecommendationStatusAction(recommendationId, nextStatus);
			if (result.ok) {
				router.refresh();
			} else {
				setError(result.error);
			}
		});
	}

	return (
		<div className="flex flex-wrap items-center gap-3">
			<span className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
				Status
			</span>

			<span
				className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
					isCompleted ? 'bg-emerald-400/10 text-emerald-400' : 'bg-muted text-muted-foreground'
				}`}
			>
				{isCompleted && <CheckCircle2 className="h-3 w-3" aria-hidden="true" />}
				{RECOMMENDATION_STATUS_LABELS[status as keyof typeof RECOMMENDATION_STATUS_LABELS] ?? status}
			</span>

			{nextStatus && (
				<Button size="xs" variant="outline" onClick={handleAdvance} disabled={isPending}>
					{isPending
						? 'Updating…'
						: nextStatus === 'completed'
							? 'Mark Complete'
							: `Mark ${RECOMMENDATION_STATUS_LABELS[nextStatus]}`}
				</Button>
			)}

			{error && <span className="text-xs text-destructive">{error}</span>}
		</div>
	);
}

function ImpactBadge({ impact }: { impact: Recommendation['impact'] }) {
	const styles = {
		High: 'bg-destructive/10 text-destructive border-destructive/20',
		Medium: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
		Low: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
	};

	return (
		<span
			className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[impact]}`}
		>
			{impact} Impact
		</span>
	);
}

function EffortBadge({ effort }: { effort: Recommendation['effort'] }) {
	const styles = {
		Low: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
		Medium: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
		High: 'bg-destructive/10 text-destructive border-destructive/20',
	};

	return (
		<span
			className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[effort]}`}
		>
			{effort} Effort
		</span>
	);
}
