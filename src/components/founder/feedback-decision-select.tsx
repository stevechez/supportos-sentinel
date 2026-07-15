'use client';

import { useTransition } from 'react';

import { setFeedbackDecisionAction } from '@/lib/founder/actions';
import { FEEDBACK_DECISION_LABELS, type FeedbackDecision } from '@/lib/feedback/types';

const DECISIONS: FeedbackDecision[] = ['build', 'fix', 'document', 'ignore', 'investigate'];

interface FeedbackDecisionSelectProps {
	feedbackId: string;
	decision: FeedbackDecision | null;
}

// Phase 20D -- turning one feedback item into a decision. Saves on change,
// same pattern as PilotStatusSelect -- triage should be as fast as
// reading the item.
export function FeedbackDecisionSelect({ feedbackId, decision }: FeedbackDecisionSelectProps) {
	const [isPending, startTransition] = useTransition();

	function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
		const next = event.target.value;
		startTransition(async () => {
			await setFeedbackDecisionAction(feedbackId, next, '');
		});
	}

	return (
		<select
			value={decision ?? ''}
			onChange={handleChange}
			disabled={isPending}
			className="rounded-md border border-white/10 bg-background px-2 py-1 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/30"
		>
			<option value="" disabled>
				Undecided
			</option>
			{DECISIONS.map(value => (
				<option key={value} value={value}>
					{FEEDBACK_DECISION_LABELS[value]}
				</option>
			))}
		</select>
	);
}
