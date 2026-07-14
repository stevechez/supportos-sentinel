import { MessagesSquare } from 'lucide-react';

import type { ConversationSummary } from '@/lib/signals/conversations';

interface CustomerConversationsCardProps {
	summary: ConversationSummary;
}

// Phase 11F: a calm summary, not a scoreboard. Deliberately no "AI
// Performance Score: 83%" -- Sentinel isn't evaluating the AI's quality
// yet, it's only surfacing what's recurring across conversations.
export function CustomerConversationsCard({ summary }: CustomerConversationsCardProps) {
	return (
		<div className="rounded-xl border bg-card shadow-sm">
			<div className="flex items-center gap-2 border-b px-6 py-4">
				<MessagesSquare className="h-5 w-5 text-primary" aria-hidden="true" />
				<div>
					<h2 className="font-heading text-lg text-foreground">Customer Conversations</h2>
					<p className="text-sm text-muted-foreground">What Sentinel has noticed across chat conversations</p>
				</div>
			</div>

			<div className="grid grid-cols-3 divide-x p-6 text-center">
				<Stat value={summary.conversationsAnalyzed} label="conversations analyzed" />
				<Stat value={summary.recurringQuestionsDetected} label="recurring questions detected" />
				<Stat value={summary.knowledgeGapsDiscovered} label="knowledge gaps discovered" />
			</div>
		</div>
	);
}

function Stat({ value, label }: { value: number; label: string }) {
	return (
		<div className="px-3">
			<div className="font-heading text-2xl text-foreground">{value}</div>
			<div className="mt-1 text-xs text-muted-foreground">{label}</div>
		</div>
	);
}
