import { Inbox, ArrowUpRight, Repeat, ShieldCheck } from 'lucide-react';

import { Container } from '@/components/marketing/container';
import { EmptyState } from '@/components/dashboard/empty-state';
import { getSupportInboxOverview } from '@/lib/signals/support-inbox';

// Phase 21D: the first real Support Operations surface. Per the Phase 21A
// audit, `tickets` has always been the direct input to every Sentinel
// signal, but a user has never been able to see the raw operational
// picture Sentinel draws conclusions from -- only the conclusions
// themselves. This page reuses getResolutionOverview() (Phase 15C) and
// getSignalsOverview()'s pattern detection (Phase 8D); no new schema, no
// new AI, just a direct view of open tickets and already-detected patterns.

function formatDate(value: string): string {
	return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default async function SupportInboxPage() {
	const overview = await getSupportInboxOverview();

	if (!overview) {
		return (
			<section className="py-10">
				<Container>
					<EmptyState
						icon={Inbox}
						title="No organization found"
						description="Your account isn't linked to an organization yet."
					/>
				</Container>
			</section>
		);
	}

	const { openTickets, pendingEscalations, frequentQuestions, recurringIssues, resolution } = overview;

	return (
		<section className="py-10">
			<Container>
				<div className="max-w-3xl">
					<p className="text-sm font-medium uppercase tracking-wide text-brand">
						Support Inbox
					</p>

					<h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
						Your support operations, at a glance
					</h1>

					<p className="mt-4 text-muted-foreground">
						What&rsquo;s still open, what needed a human, and what keeps coming up --
						the same ticket data Sentinel&rsquo;s findings are built from.
					</p>
				</div>

				<div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
					<Stat value={openTickets.length} label="open conversations" />
					<Stat value={pendingEscalations.length} label="pending escalations" />
					<Stat
						value={resolution.aiResolutionRate !== null ? `${resolution.aiResolutionRate}%` : '—'}
						label="resolved by AI"
					/>
					<Stat value={recurringIssues.length} label="recurring issues" />
				</div>

				<div className="mt-10 grid gap-6 lg:grid-cols-2">
					<Section
						icon={Inbox}
						title="Open conversations"
						description="Still open or waiting on a reply"
					>
						{openTickets.length === 0 ? (
							<EmptyRow text="Nothing open right now." />
						) : (
							<ul className="divide-y">
								{openTickets.slice(0, 10).map(ticket => (
									<li key={ticket.id} className="flex items-center justify-between gap-3 py-3">
										<div>
											<p className="text-sm text-foreground">{ticket.subject}</p>
											<p className="text-xs text-muted-foreground">{formatDate(ticket.createdAt)}</p>
										</div>
										{ticket.isEscalated && (
											<span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-400/10 px-2 py-0.5 text-xs font-medium text-amber-400">
												<ArrowUpRight className="h-3 w-3" aria-hidden="true" />
												Escalated
											</span>
										)}
									</li>
								))}
							</ul>
						)}
					</Section>

					<Section
						icon={ArrowUpRight}
						title="Pending escalations"
						description="Open, and already handed to a human"
					>
						{pendingEscalations.length === 0 ? (
							<EmptyRow text="No escalations waiting right now." />
						) : (
							<ul className="divide-y">
								{pendingEscalations.slice(0, 10).map(ticket => (
									<li key={ticket.id} className="py-3">
										<p className="text-sm text-foreground">{ticket.subject}</p>
										<p className="text-xs text-muted-foreground">{formatDate(ticket.createdAt)}</p>
									</li>
								))}
							</ul>
						)}
					</Section>

					<Section
						icon={Repeat}
						title="Recent questions"
						description="Subjects that keep coming up"
					>
						{frequentQuestions.length === 0 ? (
							<EmptyRow text="Nothing repeats often enough yet to call out." />
						) : (
							<ul className="divide-y">
								{frequentQuestions.map(question => (
									<li key={question.subject} className="flex items-center justify-between gap-3 py-3">
										<span className="text-sm text-foreground">{question.subject}</span>
										<span className="shrink-0 text-xs text-muted-foreground">{question.count}&times;</span>
									</li>
								))}
							</ul>
						)}
					</Section>

					<Section
						icon={ShieldCheck}
						title="Recurring issues"
						description="Patterns Sentinel has already detected"
					>
						{recurringIssues.length === 0 ? (
							<EmptyRow text="No recurring patterns detected yet." />
						) : (
							<ul className="divide-y">
								{recurringIssues.map(pattern => (
									<li key={pattern.key} className="flex items-center justify-between gap-3 py-3">
										<span className="text-sm text-foreground">{pattern.title}</span>
										<span className="shrink-0 text-xs text-muted-foreground">
											{pattern.recurrenceCount}&times; over {pattern.daySpan}d
										</span>
									</li>
								))}
							</ul>
						)}
					</Section>
				</div>
			</Container>
		</section>
	);
}

function Stat({ value, label }: { value: number | string; label: string }) {
	return (
		<div className="rounded-xl border border-border bg-card p-4 text-center">
			<div className="font-heading text-2xl text-foreground">{value}</div>
			<div className="mt-1 text-xs text-muted-foreground">{label}</div>
		</div>
	);
}

function Section({
	icon: Icon,
	title,
	description,
	children,
}: {
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	title: string;
	description: string;
	children: React.ReactNode;
}) {
	return (
		<div className="rounded-2xl border border-border bg-card p-6">
			<div className="flex items-center gap-2">
				<Icon className="h-4 w-4 text-brand" aria-hidden="true" />
				<h2 className="font-medium text-foreground">{title}</h2>
			</div>
			<p className="mt-1 text-xs text-muted-foreground">{description}</p>
			<div className="mt-3">{children}</div>
		</div>
	);
}

function EmptyRow({ text }: { text: string }) {
	return <p className="py-3 text-sm text-muted-foreground">{text}</p>;
}
