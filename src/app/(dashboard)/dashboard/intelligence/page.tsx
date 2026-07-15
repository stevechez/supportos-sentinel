import Link from 'next/link';
import { Bot, MessagesSquare, ClipboardList, FileText, BookOpen, ArrowRight } from 'lucide-react';

import { Container } from '@/components/marketing/container';
import { getResolutionOverview } from '@/lib/signals/data';

// Phase 21B/21E rewrite. The Phase 21A audit flagged this page as the
// single most misleading surface in the product: it showed three
// hardcoded "Active" / "Ready" assistant cards with no data behind them --
// nothing in this app runs a live "Customer Assistant" or "Knowledge
// Assistant" process. Rather than delete the route (it may be bookmarked,
// and the URL itself is reasonable), this rewrite replaces the fake status
// cards with an honest explanation of what actually happens -- deterministic
// rules over your own ticket/conversation data, with AI only ever
// explaining what those rules found -- plus direct links to where that
// output lives. No new capability is implied here that isn't real
// elsewhere in the product.

const links = [
	{ href: '/dashboard/inbox', label: 'Inbox', description: 'What happened in each recent conversation', icon: MessagesSquare },
	{ href: '/findings', label: 'Findings', description: 'Patterns Sentinel has flagged', icon: FileText },
	{ href: '/recommendations', label: 'Recommendations', description: 'What to do about them', icon: ClipboardList },
	{ href: '/dashboard/knowledge-gaps', label: 'Knowledge Gaps', description: 'Where documentation is missing', icon: BookOpen },
];

export default async function IntelligencePage() {
	const resolution = await getResolutionOverview();
	const metrics = resolution?.metrics;

	return (
		<section className="py-10">
			<Container>
				<div className="max-w-3xl">
					<p className="text-sm font-medium uppercase tracking-wide text-brand">
						How Sentinel&rsquo;s AI works
					</p>

					<h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
						Rules detect. AI explains. You decide.
					</h1>

					<p className="mt-4 text-muted-foreground">
						Sentinel doesn&rsquo;t run a hidden assistant in the background. It applies
						the same fixed rules every time to your own ticket and conversation
						data -- the same rules, in plain sight, every time -- to detect
						patterns, and only uses AI afterward to explain what those rules
						found in plain language. AI never decides anything on your behalf
						and never changes your data.
					</p>

					<p className="mt-4 text-muted-foreground">
						The one exception is the{' '}
						<Link href="/dashboard/assistant" className="font-medium text-brand hover:underline">
							AI Assistant
						</Link>
						, which answers a customer&rsquo;s question directly rather than
						explaining a conclusion Sentinel already reached. Its answers are
						saved as a real, visible conversation in your Inbox -- never
						applied silently, and it never takes an action on your behalf,
						only replies in words.
					</p>
				</div>

				{metrics && metrics.totalTickets > 0 && (
					<div className="mt-8 grid grid-cols-3 gap-4 rounded-2xl border border-border bg-card p-6 text-center">
						<div>
							<div className="font-heading text-2xl text-foreground">
								{metrics.aiResolutionRate !== null ? `${metrics.aiResolutionRate}%` : '—'}
							</div>
							<div className="mt-1 text-xs text-muted-foreground">resolved without a human</div>
						</div>
						<div>
							<div className="font-heading text-2xl text-foreground">{metrics.humanEscalatedCount}</div>
							<div className="mt-1 text-xs text-muted-foreground">escalated to a person</div>
						</div>
						<div>
							<div className="font-heading text-2xl text-foreground">{metrics.knowledgeReuseCount}</div>
							<div className="mt-1 text-xs text-muted-foreground">answered from existing docs</div>
						</div>
					</div>
				)}

				<div className="mt-10 space-y-3">
					<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						Where this shows up
					</p>

					{links.map(item => {
						const Icon = item.icon;
						return (
							<Link
								key={item.href}
								href={item.href}
								className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-brand/30"
							>
								<div className="flex items-center gap-4">
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
										<Icon className="h-5 w-5 text-brand" aria-hidden="true" />
									</div>
									<div>
										<p className="font-medium text-foreground">{item.label}</p>
										<p className="text-sm text-muted-foreground">{item.description}</p>
									</div>
								</div>
								<ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
							</Link>
						);
					})}
				</div>

				<div className="mt-10 flex items-start gap-3 rounded-2xl border border-border bg-muted/40 p-5">
					<Bot className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
					<p className="text-sm text-muted-foreground">
						Read the full breakdown of what AI does and doesn&rsquo;t do in Sentinel on
						the <Link href="/trust" className="font-medium text-brand hover:underline">Trust Center</Link>.
					</p>
				</div>
			</Container>
		</section>
	);
}
