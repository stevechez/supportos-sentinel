import { Minus, TrendingDown, TrendingUp } from 'lucide-react';

import type { Trend, TrendPoint } from '@/lib/dashboard/dashboard';

interface TrendSummaryCardProps {
	trend: Trend;
}

export function TrendSummaryCard({ trend }: TrendSummaryCardProps) {
	if (!trend.available) {
		return (
			<div className="rounded-xl border bg-card px-6 py-4 text-sm text-muted-foreground shadow-sm">
				{trend.message}
			</div>
		);
	}

	return (
		<div className="grid gap-4 rounded-xl border bg-card p-6 shadow-sm sm:grid-cols-3">
			{trend.healthScore && (
				<TrendStat label="Health Score" point={trend.healthScore} higherIsBetter />
			)}
			{trend.criticalFindings && (
				<TrendStat label="Critical Findings" point={trend.criticalFindings} higherIsBetter={false} />
			)}
			{trend.knowledgeGaps && (
				<TrendStat label="Knowledge Gaps" point={trend.knowledgeGaps} higherIsBetter={false} />
			)}
		</div>
	);
}

function TrendStat({
	label,
	point,
	higherIsBetter,
}: {
	label: string;
	point: TrendPoint;
	higherIsBetter: boolean;
}) {
	const isImprovement = higherIsBetter ? point.delta > 0 : point.delta < 0;
	const isFlat = point.delta === 0;

	const Icon = isFlat ? Minus : isImprovement ? TrendingUp : TrendingDown;
	const colorClass = isFlat
		? 'text-muted-foreground'
		: isImprovement
			? 'text-emerald-400'
			: 'text-destructive';

	return (
		<div>
			<div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
				{label}
			</div>

			<div className="mt-1 flex items-center gap-2">
				<span className="text-lg font-semibold text-foreground">
					{point.previous} &rarr; {point.current}
				</span>

				<span className={`flex items-center gap-0.5 text-sm font-medium ${colorClass}`}>
					<Icon className="h-3.5 w-3.5" aria-hidden="true" />
					{point.delta > 0 ? '+' : ''}
					{point.delta}
				</span>
			</div>
		</div>
	);
}
