import { Sparkles, TrendingUp } from 'lucide-react';

interface ExecutiveSummaryCardProps {
	summary: string;
	keyTakeaway: string;
	topRisks: string[];
	potentialScoreGain: number;
}

export function ExecutiveSummaryCard({
	summary,
	keyTakeaway,
	topRisks,
	potentialScoreGain,
}: ExecutiveSummaryCardProps) {
	return (
		<div className="rounded-xl border bg-card shadow-sm">
			<div className="border-b px-6 py-4">
				<div className="flex items-center gap-2">
					<Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />

					<h2 className="font-heading text-lg text-foreground">
						Executive Summary
					</h2>
				</div>

				<p className="mt-1 text-sm text-muted-foreground">
					Rule-based operational briefing
				</p>
			</div>

			<div className="space-y-6 p-6">
				<p className="text-base leading-7 text-foreground">{summary}</p>

				{topRisks.length > 0 && (
					<div>
						<div className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
							Biggest Risks
						</div>

						<ol className="space-y-1.5">
							{topRisks.map((risk, index) => (
								<li key={risk} className="flex gap-2 text-sm leading-6">
									<span className="text-muted-foreground">{index + 1}.</span>
									{risk}
								</li>
							))}
						</ol>
					</div>
				)}

				<div className="rounded-lg border bg-muted/40 p-4">
					<div className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
						Key Takeaway
					</div>

					<p className="text-sm leading-6">{keyTakeaway}</p>

					{potentialScoreGain > 0 && (
						<div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-emerald-400">
							<TrendingUp className="h-4 w-4" aria-hidden="true" />
							Fixing these first could improve your score by up to {potentialScoreGain} points.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
