'use client';

import { useTransition } from 'react';

import { updatePilotStatusAction } from '@/lib/founder/actions';
import { PILOT_STATUSES, PILOT_STATUS_LABELS, type PilotStatus } from '@/lib/founder/data';

interface PilotStatusSelectProps {
	organizationId: string;
	status: PilotStatus;
}

// Phase 20B -- the one editable field in the pilot list itself. A plain
// <select> that saves on change, no separate "Save" button -- pilot status
// is meant to be updated in passing during a weekly review, not to be a
// form someone fills out.
export function PilotStatusSelect({ organizationId, status }: PilotStatusSelectProps) {
	const [isPending, startTransition] = useTransition();

	function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
		const next = event.target.value;
		startTransition(async () => {
			await updatePilotStatusAction(organizationId, next);
		});
	}

	return (
		<select
			value={status}
			onChange={handleChange}
			disabled={isPending}
			className="rounded-md border border-white/10 bg-background px-2 py-1 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/30"
		>
			{PILOT_STATUSES.map(value => (
				<option key={value} value={value}>
					{PILOT_STATUS_LABELS[value]}
				</option>
			))}
		</select>
	);
}
