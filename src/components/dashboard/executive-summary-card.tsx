import { Sparkles } from 'lucide-react';

interface ExecutiveSummaryCardProps {
	summary: string;
	keyTakeaway: string;
}

export function ExecutiveSummaryCard({
	summary,
	keyTakeaway,
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
					AI-generated operational briefing
				</p>
			</div>

			<div className="space-y-6 p-6">
				<p className="text-base leading-7 text-foreground">{summary}</p>

				<div className="rounded-lg border bg-muted/40 p-4">
					<div className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
						Key Takeaway
					</div>

					<p className="text-sm leading-6">{keyTakeaway}</p>
				</div>
			</div>
		</div>
	);
}
