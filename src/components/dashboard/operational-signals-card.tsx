'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Antenna, CheckCircle2, Plus, Radar, Sparkles, Wand2 } from 'lucide-react';

import { EmptyState } from './empty-state';
import { Button } from '@supportos/ui/components/button';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from '@supportos/ui/components/sheet';

import { explainSignalPatternAction } from '@/lib/ai/actions';
import type { SignalPatternExplanation } from '@/lib/ai/types';
import { addSignalAction, createFindingFromPatternAction } from '@/lib/signals/actions';
import type { SignalPattern } from '@/lib/signals/patterns';
import { SIGNAL_TYPE_LABELS, SIGNAL_TYPES } from '@/lib/signals/types';
import type { OperationalSignal, SignalType } from '@/lib/signals/types';

interface OperationalSignalsCardProps {
	signals: OperationalSignal[];
	patterns: SignalPattern[];
}

// Phase 8: "Sentinel observes." This card is deliberately just a count
// summary, a way to log a new signal, and the candidate patterns
// deterministic grouping has already found -- never a ticket inbox, a
// workflow builder, or anything resembling a support desk.
export function OperationalSignalsCard({ signals, patterns }: OperationalSignalsCardProps) {
	const [addOpen, setAddOpen] = useState(false);
	const summary = buildSummary(signals, patterns);

	return (
		<div className="rounded-xl border bg-card shadow-sm">
			<div className="flex items-center justify-between border-b px-6 py-4">
				<div className="flex items-center gap-2">
					<Antenna className="h-5 w-5 text-primary" aria-hidden="true" />
					<div>
						<h2 className="font-heading text-lg text-foreground">Operational Signals</h2>
						<p className="text-sm text-muted-foreground">
							What your team is logging, and what Sentinel has noticed repeating
						</p>
					</div>
				</div>

				<Button size="xs" variant="outline" onClick={() => setAddOpen(true)}>
					<Plus className="h-3.5 w-3.5" aria-hidden="true" />
					Add Signal
				</Button>
			</div>

			{signals.length === 0 ? (
				<EmptyState
					icon={Radar}
					title="No signals logged yet."
					description="Log a ticket, conversation, or piece of feedback and Sentinel will start watching for recurring patterns."
				/>
			) : (
				<div className="p-5">
					<p className="text-sm text-foreground">{summary}</p>

					{patterns.length > 0 && (
						<div className="mt-4 space-y-3 border-t pt-4">
							{patterns.map(pattern => (
								<PatternRow key={pattern.key} pattern={pattern} />
							))}
						</div>
					)}
				</div>
			)}

			<AddSignalSheet open={addOpen} onOpenChange={setAddOpen} />
		</div>
	);
}

function buildSummary(signals: OperationalSignal[], patterns: SignalPattern[]): string {
	const counts = new Map<SignalType, number>();
	for (const signal of signals) {
		counts.set(signal.type, (counts.get(signal.type) ?? 0) + 1);
	}

	const parts = SIGNAL_TYPES.filter(type => counts.get(type)).map(type => {
		const count = counts.get(type) ?? 0;
		const label = SIGNAL_TYPE_LABELS[type].toLowerCase();
		return `${count} ${label}${count === 1 ? '' : count > 1 && !label.endsWith('s') ? 's' : ''}`;
	});

	if (patterns.length > 0) {
		parts.push(`${patterns.length} recurring issue${patterns.length === 1 ? '' : 's'} detected`);
	}

	return parts.join(' · ');
}

type ExplainState =
	| { status: 'idle' }
	| { status: 'loading' }
	| { status: 'success'; explanation: SignalPatternExplanation }
	| { status: 'error'; message: string };

function PatternRow({ pattern }: { pattern: SignalPattern }) {
	const router = useRouter();
	const [explainState, setExplainState] = useState<ExplainState>({ status: 'idle' });
	const [creating, setCreating] = useState(false);
	const [createError, setCreateError] = useState<string | null>(null);
	const [created, setCreated] = useState(false);
	const [isPending, startTransition] = useTransition();

	function handleExplain() {
		setExplainState({ status: 'loading' });
		startTransition(async () => {
			const result = await explainSignalPatternAction(pattern.signalIds);
			if (result.ok) {
				setExplainState({ status: 'success', explanation: result.explanation });
			} else {
				setExplainState({ status: 'error', message: result.error });
			}
		});
	}

	function handleCreateFinding() {
		setCreating(true);
		setCreateError(null);
		startTransition(async () => {
			const result = await createFindingFromPatternAction(pattern.signalIds);
			setCreating(false);
			if (result.ok) {
				setCreated(true);
				router.refresh();
			} else {
				setCreateError(result.error);
			}
		});
	}

	return (
		<div className="rounded-lg border bg-muted/30 p-4">
			<div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
				<div>
					<h3 className="text-sm font-medium text-foreground">{pattern.title}</h3>
					<p className="mt-1 text-xs text-muted-foreground">
						{SIGNAL_TYPE_LABELS[pattern.type]} · {pattern.recurrenceCount} signals over{' '}
						{pattern.daySpan} day{pattern.daySpan === 1 ? '' : 's'}
					</p>
				</div>

				<div className="flex shrink-0 items-center gap-2">
					{explainState.status === 'idle' && (
						<Button size="xs" variant="ghost" onClick={handleExplain} disabled={isPending}>
							<Wand2 className="h-3 w-3" aria-hidden="true" />
							Explain
						</Button>
					)}

					{created ? (
						<span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
							<CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
							Finding created
						</span>
					) : (
						<Button size="xs" variant="outline" onClick={handleCreateFinding} disabled={creating || isPending}>
							{creating ? 'Creating…' : 'Create Finding'}
						</Button>
					)}
				</div>
			</div>

			{explainState.status === 'loading' && (
				<p className="mt-2 text-xs text-muted-foreground">Asking Sentinel&apos;s advisor…</p>
			)}

			{explainState.status === 'error' && (
				<div className="mt-2 flex items-center gap-2">
					<p className="text-xs text-destructive">{explainState.message}</p>
					<Button size="xs" variant="ghost" onClick={handleExplain}>
						Try again
					</Button>
				</div>
			)}

			{explainState.status === 'success' && (
				<div className="mt-3 rounded-lg border bg-card p-3">
					<div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
						<Sparkles className="h-3 w-3" aria-hidden="true" />
						AI Explanation
					</div>
					<p className="mt-1.5 text-sm text-foreground">{explainState.explanation.summary}</p>
				</div>
			)}

			{createError && <p className="mt-2 text-xs text-destructive">{createError}</p>}
		</div>
	);
}

function AddSignalSheet({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);
	const [type, setType] = useState<SignalType>('ticket');
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		startTransition(async () => {
			const result = await addSignalAction({ type, title, content: content || null });
			if (result.ok) {
				setTitle('');
				setContent('');
				onOpenChange(false);
				router.refresh();
			} else {
				setError(result.error);
			}
		});
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="flex flex-col gap-0 overflow-y-auto bg-card p-0">
				<SheetHeader className="border-b px-6 py-5">
					<SheetTitle className="font-heading text-lg">Add Operational Signal</SheetTitle>
					<p className="text-xs text-muted-foreground">
						Log a ticket, conversation, feedback item, knowledge gap, or metric. Sentinel will
						watch for this repeating.
					</p>
				</SheetHeader>

				<form onSubmit={handleSubmit} className="space-y-4 p-6">
					{error && (
						<p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
							{error}
						</p>
					)}

					<div>
						<label htmlFor="signal-type" className="mb-1.5 block text-sm font-medium text-foreground">
							Type
						</label>
						<select
							id="signal-type"
							value={type}
							onChange={event => setType(event.target.value as SignalType)}
							className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
						>
							{SIGNAL_TYPES.map(t => (
								<option key={t} value={t}>
									{SIGNAL_TYPE_LABELS[t]}
								</option>
							))}
						</select>
					</div>

					<div>
						<label htmlFor="signal-title" className="mb-1.5 block text-sm font-medium text-foreground">
							Title
						</label>
						<input
							id="signal-title"
							required
							value={title}
							onChange={event => setTitle(event.target.value)}
							placeholder="e.g. Customer couldn't reset password"
							className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
						/>
					</div>

					<div>
						<label htmlFor="signal-content" className="mb-1.5 block text-sm font-medium text-foreground">
							Description <span className="text-muted-foreground">(optional)</span>
						</label>
						<textarea
							id="signal-content"
							value={content}
							onChange={event => setContent(event.target.value)}
							rows={4}
							placeholder="Any additional context"
							className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
						/>
					</div>

					<Button type="submit" className="w-full" disabled={isPending}>
						{isPending ? 'Saving…' : 'Save Signal'}
					</Button>
				</form>
			</SheetContent>
		</Sheet>
	);
}
