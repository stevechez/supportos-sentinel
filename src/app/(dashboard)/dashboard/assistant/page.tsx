import { Bot } from 'lucide-react';

import { Container } from '@/components/marketing/container';
import { AssistantChat } from '@/components/dashboard/assistant-chat';

// Phase 21D: the AI Assistant. Deliberately a single-turn demo of the
// full loop (customer asks -> AI answers -> conversation stored ->
// SupportOS updates -> Sentinel learns on the next sync), not a full
// chat product -- there is no conversation history, no follow-up turns,
// and no autonomy beyond replying once. Every question and answer here
// becomes a real, visible row in the Inbox that your team can review.
export default function AssistantPage() {
	return (
		<section className="py-10">
			<Container>
				<div className="max-w-3xl">
					<p className="text-sm font-medium uppercase tracking-wide text-brand">
						AI Assistant
					</p>

					<h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
						Try the AI Assistant
					</h1>

					<p className="mt-4 text-muted-foreground">
						Ask a support question the way a customer would. The AI answers
						directly, and the exchange is saved as a real conversation your
						team can review in the Inbox -- the same way a support agent&rsquo;s
						reply would be.
					</p>
				</div>

				<div className="mt-8 max-w-2xl">
					<AssistantChat />
				</div>

				<div className="mt-6 flex max-w-2xl items-start gap-3 rounded-2xl border border-border bg-muted/40 p-5">
					<Bot className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
					<p className="text-sm text-muted-foreground">
						This is one question, one answer -- the assistant doesn&rsquo;t
						remember earlier turns, take actions on an account, or resolve
						anything beyond replying in words. See{' '}
						<a href="/dashboard/intelligence" className="font-medium text-brand hover:underline">
							How Sentinel&rsquo;s AI works
						</a>{' '}
						for how AI is used elsewhere in the product.
					</p>
				</div>
			</Container>
		</section>
	);
}
