import { Sparkles } from 'lucide-react';

interface ExecutiveSummaryCardProps {
	summary?: string;
}

export function ExecutiveSummaryCard({
	summary = 'Customer operations remain healthy overall, but two emerging risks require attention. Checkout payment failures increased following the latest deployment, while repeated questions about subscription cancellations indicate a documentation gap. Addressing these issues is expected to reduce support volume and improve customer satisfaction over the coming week.',
}: ExecutiveSummaryCardProps) {
	return (
		<div className="rounded-xl border bg-card shadow-sm">
			<div className="border-b px-6 py-4">
				<div className="flex items-center gap-2">
					<Sparkles className="h-5 w-5 text-primary" />

					<h2 className="text-lg font-semibold">Executive Summary</h2>
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

					<p className="text-sm leading-6">
						Prioritize payment reliability first. Resolving the checkout issue
						is expected to have the greatest impact on customer satisfaction and
						revenue, while publishing the missing cancellation documentation
						should reduce repetitive support requests.
					</p>
				</div>
			</div>
		</div>
	);
}
