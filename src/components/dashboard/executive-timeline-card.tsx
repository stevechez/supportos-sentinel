import { AlertTriangle, CheckCircle2, History, TrendingUp } from 'lucide-react';

import { EmptyState } from './empty-state';

import type { TimelineEvent } from '@/lib/dashboard/dashboard';

interface ExecutiveTimelineCardProps {
	events: TimelineEvent[];
}

const EVENT_ICON: Record<TimelineEvent['type'], React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
	finding_detected: AlertTriangle,
	finding_resolved: CheckCircle2,
	recommendation_completed: CheckCircle2,
	impact_measured: TrendingUp,
};

const EVENT_ACCENT: Record<TimelineEvent['type'], string> = {
	finding_detected: 'text-destructive bg-destructive/10',
	finding_resolved: 'text-emerald-400 bg-emerald-400/10',
	recommendation_completed: 'text-emerald-400 bg-emerald-400/10',
	impact_measured: 'text-primary bg-primary/10',
};

function formatEventDate(isoDate: string): string {
	return new Date(isoDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

export function ExecutiveTimelineCard({ events }: ExecutiveTimelineCardProps) {
	return (
		<div className="rounded-xl border bg-card shadow-sm">
			<div className="flex items-center gap-2 border-b px-6 py-4">
				<History className="h-5 w-5 text-primary" aria-hidden="true" />

				<div>
					<h2 className="font-heading text-lg text-foreground">
						Executive Timeline
					</h2>

					<p className="text-sm text-muted-foreground">
						What Sentinel found, what changed, and when
					</p>
				</div>
			</div>

			{events.length === 0 ? (
				<EmptyState
					icon={History}
					title="Nothing to show yet."
					description="Detected findings, completed actions, and measured impact will appear here as they happen."
				/>
			) : (
				<ol className="divide-y">
					{events.slice(0, 8).map(event => {
						const Icon = EVENT_ICON[event.type];

						return (
							<li key={event.id} className="flex gap-4 p-5">
								<div
									className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${EVENT_ACCENT[event.type]}`}
								>
									<Icon className="h-4 w-4" aria-hidden="true" />
								</div>

								<div>
									<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
										{formatEventDate(event.date)}
									</div>

									<h3 className="mt-1 font-medium text-foreground">{event.title}</h3>

									<p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
								</div>
							</li>
						);
					})}
				</ol>
			)}
		</div>
	);
}
