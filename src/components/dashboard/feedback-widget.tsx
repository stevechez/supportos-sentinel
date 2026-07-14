'use client';

import { useState, useTransition } from 'react';
import { MessageSquarePlus } from 'lucide-react';

import { Button } from '@supportos/ui/components/button';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetClose,
} from '@supportos/ui/components/sheet';

import { submitFeedbackAction } from '@/lib/feedback/actions';
import { FEEDBACK_TYPE_LABELS, type FeedbackType } from '@/lib/feedback/types';

const TYPES: FeedbackType[] = ['confusion', 'missing_capability', 'bug', 'value'];

// Phase 18E -- the one global feedback entry point present on every
// dashboard page (mounted once in DashboardShell). Deliberately not a
// survey or NPS widget: four fixed categories matching the handoff's own
// examples, one text field, one submit. The goal during a pilot is
// capturing what a real customer says in their own words, not scoring
// them.
export function FeedbackWidget() {
	const [open, setOpen] = useState(false);
	const [type, setType] = useState<FeedbackType>('confusion');
	const [message, setMessage] = useState('');
	const [isPending, startTransition] = useTransition();
	const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
	const [error, setError] = useState<string | null>(null);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		startTransition(async () => {
			const result = await submitFeedbackAction(type, message, 'feedback_widget');
			if (result.ok) {
				setStatus('success');
				setMessage('');
			} else {
				setStatus('error');
				setError(result.error);
			}
		});
	}

	function handleOpenChange(next: boolean) {
		setOpen(next);
		if (next) {
			// Reset to a clean form each time it's opened, but only after
			// closing -- so a just-submitted confirmation doesn't flash away.
			setStatus('idle');
			setError(null);
		}
	}

	return (
		<Sheet open={open} onOpenChange={handleOpenChange}>
			<Button
				variant="outline"
				size="sm"
				className="fixed bottom-6 right-6 z-40 gap-2 rounded-full shadow-lg"
				onClick={() => setOpen(true)}
			>
				<MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
				Feedback
			</Button>

			<SheetContent side="right" className="flex flex-col gap-0 border-l border-white/10 p-0">
				<SheetHeader className="border-b px-6 py-5">
					<SheetTitle className="font-heading text-lg">Send feedback</SheetTitle>
					<p className="text-xs text-muted-foreground">
						A real person reads every message. Tell us what happened.
					</p>
				</SheetHeader>

				<div className="flex-1 overflow-y-auto p-6">
					{status === 'success' ? (
						<div className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-400">
							Thanks -- your feedback was sent.
						</div>
					) : (
						<form onSubmit={handleSubmit} className="space-y-5">
							<div>
								<label className="mb-2 block text-sm font-medium text-foreground">
									What kind of feedback is this?
								</label>
								<div className="grid grid-cols-1 gap-2">
									{TYPES.map(t => (
										<button
											key={t}
											type="button"
											onClick={() => setType(t)}
											className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
												type === t
													? 'border-brand/50 bg-brand/10 text-foreground'
													: 'border-white/10 text-muted-foreground hover:border-white/20'
											}`}
										>
											{FEEDBACK_TYPE_LABELS[t]}
										</button>
									))}
								</div>
							</div>

							<div>
								<label htmlFor="feedback-message" className="mb-2 block text-sm font-medium text-foreground">
									Tell us more
								</label>
								<textarea
									id="feedback-message"
									value={message}
									onChange={e => setMessage(e.target.value)}
									required
									rows={5}
									placeholder="What happened, and what did you expect instead?"
									className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-brand/50 focus:ring-2 focus:ring-brand/30"
								/>
							</div>

							{error ? <p className="text-sm text-destructive">{error}</p> : null}

							<div className="flex items-center gap-3">
								<Button type="submit" disabled={isPending}>
									{isPending ? 'Sending…' : 'Send feedback'}
								</Button>
								<SheetClose
									render={
										<button type="button" className="text-sm text-muted-foreground hover:text-foreground" />
									}
								>
									Cancel
								</SheetClose>
							</div>
						</form>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
