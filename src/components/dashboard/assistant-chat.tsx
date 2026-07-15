'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Bot, Send, User } from 'lucide-react';

import { Button } from '@supportos/ui/components/button';

import { askAssistantAction } from '@/lib/assistant/actions';

type State =
	| { status: 'idle' }
	| { status: 'loading'; question: string }
	| { status: 'answered'; question: string; answer: string; ticketId: string }
	| { status: 'error'; question: string; message: string };

// Phase 21D: a single-turn demo of the full loop --
//   Customer asks -> AI answers -> conversation stored -> SupportOS
//   updates -> Sentinel learns (next sync)
// One question in, one answer out, both written to a real ticket. No chat
// history, no follow-up turns -- this demonstrates the loop, it isn't a
// full support inbox replacement.
export function AssistantChat() {
	const router = useRouter();
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [question, setQuestion] = useState('');
	const [state, setState] = useState<State>({ status: 'idle' });
	const [isPending, startTransition] = useTransition();

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const trimmed = question.trim();
		if (!trimmed) {
			return;
		}
		setState({ status: 'loading', question: trimmed });
		startTransition(async () => {
			const result = await askAssistantAction(name, email, trimmed);
			if (result.ok) {
				setState({ status: 'answered', question: trimmed, answer: result.answer, ticketId: result.ticketId });
				setQuestion('');
				router.refresh();
			} else {
				setState({ status: 'error', question: trimmed, message: result.error });
			}
		});
	}

	const isLoading = isPending || state.status === 'loading';

	return (
		<div className="rounded-2xl border border-border bg-card">
			<div className="border-b p-5">
				<div className="grid gap-3 sm:grid-cols-2">
					<div>
						<label htmlFor="assistant-name" className="mb-1.5 block text-xs font-medium text-muted-foreground">
							Customer name (optional)
						</label>
						<input
							id="assistant-name"
							value={name}
							onChange={e => setName(e.target.value)}
							placeholder="Demo Customer"
							className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/30"
						/>
					</div>
					<div>
						<label htmlFor="assistant-email" className="mb-1.5 block text-xs font-medium text-muted-foreground">
							Customer email (optional)
						</label>
						<input
							id="assistant-email"
							type="email"
							value={email}
							onChange={e => setEmail(e.target.value)}
							placeholder="demo-customer@example.com"
							className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/30"
						/>
					</div>
				</div>
			</div>

			<div className="space-y-4 p-5">
				{state.status !== 'idle' && (
					<div className="space-y-4">
						<div className="flex items-start gap-3">
							<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
								<User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
							</div>
							<div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm text-foreground">
								{state.question}
							</div>
						</div>

						{isLoading && (
							<div className="flex items-start gap-3">
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10">
									<Bot className="h-4 w-4 text-brand" aria-hidden="true" />
								</div>
								<div className="space-y-2 rounded-2xl rounded-tl-sm bg-brand/5 px-4 py-3">
									<div className="h-2.5 w-40 animate-pulse rounded bg-brand/20" />
									<div className="h-2.5 w-24 animate-pulse rounded bg-brand/20" />
								</div>
							</div>
						)}

						{state.status === 'answered' && (
							<div className="flex items-start gap-3">
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10">
									<Bot className="h-4 w-4 text-brand" aria-hidden="true" />
								</div>
								<div className="rounded-2xl rounded-tl-sm bg-brand/5 px-4 py-2.5 text-sm text-foreground">
									{state.answer}
								</div>
							</div>
						)}

						{state.status === 'error' && (
							<div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
								<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
								<div>
									<p className="text-sm text-foreground">{state.message}</p>
									<p className="mt-1 text-xs text-muted-foreground">
										The question was still saved as an open conversation -- nothing was lost.
									</p>
								</div>
							</div>
						)}

						{state.status === 'answered' && (
							<p className="text-xs text-muted-foreground">
								Saved as a real conversation -- view it anytime in the{' '}
								<a href="/dashboard/inbox" className="font-medium text-brand hover:underline">
									Inbox
								</a>
								.
							</p>
						)}
					</div>
				)}

				<form onSubmit={handleSubmit} className="flex items-end gap-3">
					<div className="flex-1">
						<label htmlFor="assistant-question" className="sr-only">
							Ask a question
						</label>
						<textarea
							id="assistant-question"
							value={question}
							onChange={e => setQuestion(e.target.value)}
							rows={2}
							placeholder="Ask a support question, e.g. 'How do I reset my password?'"
							className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/30"
						/>
					</div>
					<Button type="submit" disabled={isLoading || !question.trim()} className="gap-2">
						<Send className="h-4 w-4" aria-hidden="true" />
						{isLoading ? 'Asking…' : 'Ask'}
					</Button>
				</form>
			</div>
		</div>
	);
}
