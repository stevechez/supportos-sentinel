import { MessageCircle, Bot, ArrowUpRight, Clock3 } from 'lucide-react';

import { Container } from '@/components/marketing/container';
import { EmptyState } from '@/components/dashboard/empty-state';
import {
	getRecentConversations,
	CONVERSATION_OUTCOME_LABELS,
	type ConversationOutcome,
} from '@/lib/signals/conversation-list';

// Phase 21C: the first per-conversation surface in the product. Everything
// above this page has only ever shown aggregate conversation stats
// (Customer Conversations card) or Sentinel's derived output (Findings,
// Recommendations). This page answers a more basic question first: "what
// actually happened in my recent conversations" -- reusing the exact same
// tickets/messages data and escalation rule the rest of Sentinel already
// reads, just shown one conversation at a time instead of summarized away.
//
// Deliberately narrow: a recent list with an outcome, not a full inbox
// with reply, search, filtering, or real-time updates -- out of scope per
// the Phase 21 handoff.

const OUTCOME_STYLES: Record<ConversationOutcome, string> = {
	ai_handled: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
	escalated: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
	unresolved: 'bg-destructive/10 text-destructive border-destructive/20',
	resolved: 'bg-muted text-muted-foreground border-border',
};

function formatDate(value: string): string {
	return new Date(value).toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
	});
}

export default async function ConversationsPage() {
	const conversations = await getRecentConversations();

	return (
		<section className="py-10">
			<Container>
				<div className="max-w-3xl">
					<p className="text-sm font-medium uppercase tracking-wide text-brand">
						Conversations
					</p>

					<h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
						Recent customer conversations
					</h1>

					<p className="mt-4 text-muted-foreground">
						Every conversation Sentinel can see, and what happened in it -- handled
						by the AI, escalated to a person, or still open.
					</p>
				</div>

				{!conversations || conversations.length === 0 ? (
					<div className="mt-10">
						<EmptyState
							icon={MessageCircle}
							title="No conversations yet"
							description="Once your support tool is connected and conversations start coming in, they'll show up here."
						/>
					</div>
				) : (
					<div className="mt-10 divide-y rounded-2xl border border-border bg-card">
						{conversations.map(conversation => (
							<div
								key={conversation.id}
								className="flex flex-col gap-3 p-5 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
							>
								<div className="flex items-start gap-4">
									<div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10">
										{conversation.outcome === 'ai_handled' ? (
											<Bot className="h-4 w-4 text-brand" aria-hidden="true" />
										) : (
											<MessageCircle className="h-4 w-4 text-brand" aria-hidden="true" />
										)}
									</div>

									<div>
										<h2 className="font-medium text-foreground">{conversation.subject}</h2>

										<div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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
									className={`inline-flex w-fit items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${OUTCOME_STYLES[conversation.outcome]}`}
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
