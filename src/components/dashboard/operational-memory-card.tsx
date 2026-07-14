import { BrainCircuit } from 'lucide-react';

import { EmptyState } from './empty-state';
import type { ImprovementEvent } from '@/lib/dashboard/dashboard';

interface OperationalMemoryCardProps {
	events: ImprovementEvent[];
}

// Phase 12D: "Sentinel Memory." Calm, factual, no invented metrics -- the
// impact line is always the real, measured health-score delta (Phase 7's
// improvement.ts), never a fabricated ticket-volume percentage.
export function OperationalMemoryCard({ events }: OperationalMemoryCardProps) {
	if (events.length === 0) {
		return (
			<div className="rounded-xl border bg-card shadow-sm">
				<CardHeader />
				<EmptyState
					icon={BrainCircuit}
					title="No resolved history yet."
					description="Once a finding is resolved, Sentinel remembers what worked -- and can point to it the next time something similar comes up."
				/>
			</div>
		);
	}

	const topImprovement = [...events].sort((a, b) => Math.abs(b.delta ?? 0) - Math.abs(a.delta ?? 0))[0];

	return (
		<div className="rounded-xl border bg-card shadow-sm">
			<CardHeader />

			<div className="p-6">
				<div className="grid gap-6 sm:grid-cols-2">
					<div>
						<div className="font-heading text-2xl text-foreground">{events.length}</div>
						<p className="mt-1 text-sm text-muted-foreground">
							operational issue{events.length === 1 ? '' : 's'} solved
						</p>
					</div>

					<div>
						<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							Top improvement
						</p>
						<p className="mt-1 text-sm font-medium text-foreground">{topImprovement.problemTitle}</p>
						<p className="mt-1 text-sm text-muted-foreground">{topImprovement.impactSummary}</p>
					</div>
				</div>
			</div>
		</div>
	);
}

function CardHeader() {
	return (
		<div className="flex items-center gap-2 border-b px-6 py-4">
			<BrainCircuit className="h-5 w-5 text-primary" aria-hidden="true" />
			<div>
				<h2 className="font-heading text-lg text-foreground">Sentinel Memory</h2>
				<p className="text-sm text-muted-foreground">What your organization has already solved</p>
			</div>
		</div>
	);
}
