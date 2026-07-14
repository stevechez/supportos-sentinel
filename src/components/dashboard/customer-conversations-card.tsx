import { MessagesSquare } from 'lucide-react';

import type { ConversationSummary } from '@/lib/signals/conversations';
import type { FrequentQuestion, ResolutionMetrics } from '@/lib/signals/resolution';

interface CustomerConversationsCardProps {
	summary: ConversationSummary;
	resolution: ResolutionMetrics;
	frequentQuestions: FrequentQuestion[];
}

// Phase 11F, extended in Phase 15D: still a calm summary, not a
// scoreboard. Phase 11F's comment here used to say "no AI Performance
// Score -- Sentinel isn't evaluating the AI's quality yet." Phase 15
// changes that deliberately: an AI Resolution Rate is now shown, but
// framed the way the Phase 15D handoff requires -- an operational metric
// ("how much of this did the AI handle"), never a quality benchmark or a
// judgment about the AI itself. Every number here is a direct count from
// tickets Sentinel already had read access to (src/lib/signals/
// resolution.ts) -- no new AI, no new data source.
export function CustomerConversationsCard({
	summary,
	resolution,
	frequentQuestions,
}: CustomerConversationsCardProps) {
	return (
		<div className="rounded-xl border bg-card shadow-sm">
			<div className="flex items-center gap-2 border-b px-6 py-4">
				<MessagesSquare className="h-5 w-5 text-primary" aria-hidden="true" />
				<div>
					<h2 className="font-heading text-lg text-foreground">Customer Conversations</h2>
					<p className="text-sm text-muted-foreground">
						What Sentinel has noticed across chat conversations
					</p>
				</div>
			</div>

			<div className="grid grid-cols-3 divide-x p-6 text-center">
				<Stat value={summary.conversationsAnalyzed} label="conversations analyzed" />
				<Stat value={summary.recurringQuestionsDetected} label="recurring questions detected" />
				<Stat value={summary.knowledgeGapsDiscovered} label="knowledge gaps discovered" />
			</div>

			{resolution.totalTickets > 0 && (
				<div className="border-t p-6">
					<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						How those conversations were resolved
					</p>

					<div className="mt-3 grid grid-cols-3 divide-x text-center">
						<Stat
							value={resolution.aiResolutionRate !== null ? `${resolution.aiResolutionRate}%` : '—'}
							label="resolved by AI"
						/>
						<Stat value={resolution.humanEscalatedCount} label="escalated to a human" />
						<Stat value={resolution.knowledgeReuseCount} label="answered from knowledge base" />
					</div>
				</div>
			)}

			{frequentQuestions.length > 0 && (
				<div className="border-t p-6">
					<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						Frequently asked
					</p>

					<ul className="mt-3 space-y-2">
						{frequentQuestions.map(question => (
							<li
								key={question.subject}
								className="flex items-center justify-between gap-3 text-sm text-foreground"
							>
								<span>{question.subject}</span>
								<span className="shrink-0 text-xs text-muted-foreground">
									{question.count}&times;
								</span>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}

function Stat({ value, label }: { value: number | string; label: string }) {
	return (
		<div className="px-3">
			<div className="font-heading text-2xl text-foreground">{value}</div>
			<div className="mt-1 text-xs text-muted-foreground">{label}</div>
		</div>
	);
}
