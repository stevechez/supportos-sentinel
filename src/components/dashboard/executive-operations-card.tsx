import { Bot, ArrowUpRight, Repeat, ClipboardList, HeartPulse } from 'lucide-react';

// Phase 21F -- the "wow moment" unified operating picture. Per the
// handoff: a calm, non-chart-heavy summary a prospect or customer can read
// in a few seconds that connects the whole loop -- what the AI handled,
// what needed a person, what patterns Sentinel found, what to do about
// them, and how the operation is doing overall. Every number here is
// already computed elsewhere in the product (resolution metrics from
// Phase 15C, pattern/risk counts from Phase 8D/14B, recommendation counts
// from Phase 5, health score from Phase 5) -- this component only
// composes them into one place. No new computation, no charts, five plain
// numbers with labels.

export interface ExecutiveOperationsSummary {
	aiHandledCount: number;
	escalatedCount: number;
	patternsDetected: number;
	recommendedImprovements: number;
	healthScore: number;
}

export function ExecutiveOperationsCard({ summary }: { summary: ExecutiveOperationsSummary }) {
	return (
		<div className="rounded-2xl border border-border bg-card p-6">
			<div className="flex items-center gap-2">
				<HeartPulse className="h-4 w-4 text-brand" aria-hidden="true" />
				<h2 className="font-heading text-lg text-foreground">Your operation this week</h2>
			</div>

			<p className="mt-1 text-sm text-muted-foreground">
				How AI, your team, and Sentinel&rsquo;s findings fit together right now.
			</p>

			<div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-5">
				<Metric icon={Bot} value={summary.aiHandledCount} label="handled by AI" />
				<Metric icon={ArrowUpRight} value={summary.escalatedCount} label="escalated to a person" />
				<Metric icon={Repeat} value={summary.patternsDetected} label="patterns detected" />
				<Metric icon={ClipboardList} value={summary.recommendedImprovements} label="recommended improvements" />
				<Metric icon={HeartPulse} value={`${summary.healthScore}`} label="customer health score" />
			</div>
		</div>
	);
}

function Metric({
	icon: Icon,
	value,
	label,
}: {
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	value: number | string;
	label: string;
}) {
	return (
		<div>
			<div className="flex items-center gap-1.5 text-muted-foreground">
				<Icon className="h-3.5 w-3.5" aria-hidden="true" />
			</div>
			<div className="mt-1 font-heading text-2xl text-foreground">{value}</div>
			<div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
		</div>
	);
}
