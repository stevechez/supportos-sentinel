'use client';

import { useState, useTransition } from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';

import { submitFeedbackAction } from '@/lib/feedback/actions';

interface InsightFeedbackProps {
	/** Identifies which insight this is attached to, e.g. 'ai_executive_brief'. Stored as feedback context, never shown to the user. */
	context: string;
}

// Phase 18E -- "Was this insight useful?" A thumbs up logs feedback_type
// 'value' (the handoff's own example: "This saved me time..."); thumbs down
// logs 'confusion'. No follow-up text required on either path -- the whole
// point is that this is faster than the full feedback form, for the one
// moment (right after an AI explanation) where a reaction is easy to give
// and easy to lose if it requires typing.
export function InsightFeedback({ context }: InsightFeedbackProps) {
	const [answered, setAnswered] = useState<'up' | 'down' | null>(null);
	const [isPending, startTransition] = useTransition();

	function send(vote: 'up' | 'down') {
		setAnswered(vote);
		startTransition(async () => {
			await submitFeedbackAction(
				vote === 'up' ? 'value' : 'confusion',
				vote === 'up' ? 'Marked this insight as useful.' : 'Marked this insight as not useful.',
				context,
			);
		});
	}

	if (answered) {
		return <p className="text-xs text-muted-foreground">Thanks for the feedback.</p>;
	}

	return (
		<div className="flex items-center gap-3 text-xs text-muted-foreground">
			<span>Was this insight useful?</span>
			<button
				type="button"
				onClick={() => send('up')}
				disabled={isPending}
				aria-label="Yes, this insight was useful"
				className="rounded-md p-1 transition-colors hover:bg-white/5 hover:text-foreground"
			>
				<ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
			</button>
			<button
				type="button"
				onClick={() => send('down')}
				disabled={isPending}
				aria-label="No, this insight was not useful"
				className="rounded-md p-1 transition-colors hover:bg-white/5 hover:text-foreground"
			>
				<ThumbsDown className="h-3.5 w-3.5" aria-hidden="true" />
			</button>
		</div>
	);
}
