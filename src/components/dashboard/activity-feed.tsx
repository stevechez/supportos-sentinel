import { History } from 'lucide-react';

import { describeActivity, type ActivityEntry } from '@/lib/activity';

interface ActivityFeedProps {
	entries: ActivityEntry[];
}

function formatTimestamp(iso: string): string {
	return new Date(iso).toLocaleString(undefined, {
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	});
}

// Phase 16A: "What happened and when?" A plain, chronological record --
// not a compliance export, not a diff viewer. Every line is a
// deterministic template (describeActivity), not an AI summary.
export function ActivityFeed({ entries }: ActivityFeedProps) {
	if (entries.length === 0) {
		return (
			<div className="rounded-2xl border border-border bg-card p-6">
				<div className="flex items-center gap-3">
					<History className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
					<div>
						<h3 className="font-medium text-foreground">No activity yet.</h3>
						<p className="mt-1 text-sm text-muted-foreground">
							Actions like connecting a source, syncing data, or updating a finding will show up
							here as they happen.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-2xl border border-border bg-card p-6">
			<ul className="space-y-4">
				{entries.map(entry => (
					<li key={entry.id} className="flex items-start gap-3 text-sm">
						<History className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
						<div>
							<p className="text-foreground">{describeActivity(entry)}</p>
							<p className="mt-0.5 text-xs text-muted-foreground">{formatTimestamp(entry.createdAt)}</p>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}
