import { MessageCircle, Bot, ArrowUpRight, Clock3 } from 'lucide-react';

import { Container } from '@/components/marketing/container';
import { EmptyState } from '@/components/dashboard/empty-state';
import {
	getRecentConversations,
	CONVERSATION_OUTCOME_LABELS,
	type ConversationOutcome,
} from '@/lib/signals/conversation-list';
import { getSupportInboxOverview } from '@/lib/signals/support-inbox';

// Phase 21C (v2): the Inbox -- the single conversation experience the
// handoff asks for, over the existing tickets/messages schema (no new
// tables). Shows, per conversation, exactly what the handoff lists:
// customer, recent messages, AI participation, escalation state, and the
// linked ticket. In this schema a conversation and its ticket are the
// same row (see docs/architecture/platform-audit.md), so "linked ticket"
// is shown as a reference badge on the same row rather than a second page.
//
// The summary row at the top (open / escalated / AI resolution rate)
// reuses getSupportInboxOverview() (built for the prior nav structure,
// still the same underlying data) so the operational counts a support
// lead needs are visible without leaving the Inbox.

const OUTCOME_STYLES: Record<ConversationOutcome, string> = {
	ai_handled: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
	escalated: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
	unresolved: 'bg-destructive/10 text-destructive border-destructive/20',
	resolved: 'bg-muted text-muted-foreground border-border',
};

function formatDate(value: string): string {
	return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function truncate(value: string, max: number): string {
	return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

export default async function InboxPage() {
	const [conversations, inboxOverview] = await Promise.all([
		getRecentConversations(),
		getSupportInboxOverview(),
	]);

	return (
		<section className="py-10">
			<Container>
				<div className="max-w-3xl">
					<p className="text-sm font-medium uppercase tracking-wide text-brand">
						Inbox
					</p>

					<h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
						Your conversations
					</h1>

					<p className="mt-4 text-muted-foreground">
						Every conversation, who it was with, whether the AI handled it or
						it needed a person, and the ticket it&rsquo;s linked to.
					</p>
				</div>

				{inboxOverview && (
					<div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
						<Stat value={inboxOverview.openTickets.length} label="open" />
						<Stat value={inboxOverview.pendingEscalations.length} label="escalated" />
						<Stat
							value={
								inboxOverview.resolution.aiResolutionRate !== null
									? `${inboxOverview.resolution.aiResolutionRate}%`
									: '—'
							}
							label="resolved by AI"
						/>
						<Stat value={inboxOverview.recurringIssues.length} label="recurring issues" />
					</div>
				)}

				{!conversations || conversations.length === 0 ? (
					<div className="mt-10">
						<EmptyState
							icon={MessageCircle}
							title="No conversations yet"
							description="Once your support tool is connected -- or someone tries the AI Assistant -- conversations will show up here."
						/>
					</div>
				) : (
					<div className="mt-10 divide-y rounded-2xl border border-border bg-card">
						{conversations.map(conversation => (
							<div key={conversation.id} className="flex flex-col gap-3 p-5 transition-colors hover:bg-muted/40 sm:flex-row sm:items-start sm:justify-between">
								<div className="flex items-start gap-4">
									<div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10">
										{conversation.outcome === 'ai_handled' ? (
											<Bot className="h-4 w-4 text-brand" aria-hidden="true" />
										) : (
											<MessageCircle className="h-4 w-4 text-brand" aria-hidden="true" />
										)}
									</div>

									<div>
										<div className="flex flex-wrap items-center gap-2">
											<h2 className="font-medium text-foreground">{conversation.subject}</h2>
											<span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
												Ticket #{conversation.id.slice(0, 8)}
											</span>
										</div>

										<p className="mt-0.5 text-xs text-muted-foreground">
											{conversation.customerName ?? 'Unknown customer'}
										</p>

										{conversation.lastMessagePreview && (
											<p className="mt-1.5 text-sm text-muted-foreground">
												{truncate(conversation.lastMessagePreview, 100)}
											</p>
										)}

										<div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
											<span className="flex items-center gap-1">
												<Clock3 className="h-3 w-3" aria-hidden="true" />
												{formatDate(conversation.createdAt)}
											</span>
											<span>
												{conversation.messageCount}{' '}
												{conversation.messageCount === 1 ? 'message' : 'messages'}
											</span>
										</div>
									</div>
								</div>

								<span
									className={`inline-flex w-fit shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${OUTCOME_STYLES[conversation.outcome]}`}
								>
									{conversation.outcome === 'escalated' && (
										<ArrowUpRight className="h-3 w-3" aria-hidden="true" />
									)}
									{CONVERSATION_OUTCOME_LABELS[conversation.outcome]}
								</span>
							</div>
						))}
					</div>
				)}
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
