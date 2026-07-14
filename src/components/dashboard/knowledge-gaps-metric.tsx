'use client';

import { useState } from 'react';
import { BookOpen, CheckCircle2, CircleDashed } from 'lucide-react';

import { MetricCard } from './metric-card';
import { EmptyState } from './empty-state';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@supportos/ui/components/sheet';

import type { KnowledgeGap } from '@/lib/dashboard/dashboard';

interface KnowledgeGapsMetricProps {
	gaps: KnowledgeGap[];
}

// Wraps the plain MetricCard in a Sheet trigger so the "Knowledge Gaps" KPI
// can drill into the underlying questions and their documentation status,
// without changing MetricCard itself (still used, unmodified, by the other
// three KPI cards on this dashboard).
export function KnowledgeGapsMetric({ gaps }: KnowledgeGapsMetricProps) {
	const [open, setOpen] = useState(false);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				render={
					<button
						type="button"
						className="w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						disabled={gaps.length === 0}
					/>
				}
			>
				<MetricCard
					title="Knowledge Gaps"
					value={String(gaps.length)}
					description={gaps.length > 0 ? 'Click to view associated documentation' : 'No documentation gaps detected'}
					icon={BookOpen}
				/>
			</SheetTrigger>

			<SheetContent className="flex flex-col gap-0 overflow-y-auto bg-card p-0">
				<SheetHeader className="border-b px-6 py-5">
					<SheetTitle className="font-heading text-lg">
						Knowledge Gaps ({gaps.length})
					</SheetTitle>

					<p className="text-xs text-muted-foreground">
						Questions customers ask that documentation doesn&apos;t answer yet
					</p>
				</SheetHeader>

				{gaps.length === 0 ? (
					<EmptyState
						icon={BookOpen}
						title="No knowledge gaps"
						description="Sentinel hasn't detected any undocumented questions."
					/>
				) : (
					<div className="divide-y">
						{gaps.map(gap => (
							<div key={gap.id} className="p-5">
								<h3 className="font-medium leading-6">{gap.question}</h3>

								<p className="mt-1 text-sm text-muted-foreground">
									Asked {gap.occurrenceCount} time{gap.occurrenceCount === 1 ? '' : 's'} &middot; {gap.confidence}% confidence
								</p>

								<div className="mt-3 flex items-center gap-2 text-sm">
									{gap.hasDocumentationPlan ? (
										<>
											<CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
											<span>
												Documentation planned: <span className="font-medium text-foreground">{gap.recommendedDocument}</span>
											</span>
										</>
									) : (
										<>
											<CircleDashed className="h-4 w-4 text-amber-400" aria-hidden="true" />
											<span className="text-muted-foreground">No documentation identified yet</span>
										</>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
}
