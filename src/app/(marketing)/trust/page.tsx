import Link from 'next/link';
import { AlertTriangle, Lock, Scale, ShieldCheck, Sparkles } from 'lucide-react';

import { Container } from '@/components/marketing/container';
import { PageHeader } from '@/components/marketing/page-header';

export const metadata = {
	title: 'Trust Center | Sentinel',
	description:
		'How Sentinel uses AI, how your data is isolated, and what happens when something goes wrong.',
};

// Phase 17F -- a public Trust Center. The AI-boundary language here
// deliberately matches the in-app "AI usage & trust" section on the
// Settings page (Phase 16D) word for word where possible: what's true
// behind login should be the same thing a stranger can read before signing
// up, not a separate, softer marketing version of it.
const sections = [
	{
		icon: Sparkles,
		title: 'AI principles',
		items: [
			{
				heading: 'AI explains. It doesn’t decide.',
				body: 'Every finding, health score, priority, and trend Sentinel shows you is calculated using the same fixed rules every time -- never guessed by AI. AI is only ever asked to explain a conclusion Sentinel already reached, in plain language.',
			},
			{
				heading: 'AI does not make operational decisions.',
				body: 'It never creates a finding, sets a priority, or predicts an outcome on its own. Explanations are opt-in — you choose when to ask Sentinel to explain something, and reviewing that explanation is always a choice, not something applied automatically.',
			},
			{
				heading: 'Humans decide what happens next.',
				body: 'Sentinel surfaces patterns and recommends next steps. Your team reviews, decides, and acts. Nothing in your operation changes automatically because of an AI explanation.',
			},
		],
	},
	{
		icon: Lock,
		title: 'Data handling',
		items: [
			{
				heading: 'Organization isolation.',
				body: 'Every row of data in Sentinel is scoped to your organization at the database level (row-level security), not just filtered in the application. Another customer’s data is never visible to you, and yours is never visible to them.',
			},
			{
				heading: 'Your data, your insights.',
				body: 'Your organization’s conversations and activity are only ever used to produce your organization’s own findings and recommendations — never pooled with other customers’ data or used to train a shared model.',
			},
			{
				heading: 'You stay in control.',
				body: 'You choose what to connect, and you can review everything Sentinel has found in your Settings, including a plain audit trail of who did what and when.',
			},
		],
	},
	{
		icon: ShieldCheck,
		title: 'Reliability',
		items: [
			{
				heading: 'If a source connection fails,',
				body: 'Sentinel shows the connection as needing attention rather than silently going stale, and nothing else in your dashboard is affected — you keep seeing the insights already generated from data that did sync.',
			},
			{
				heading: 'If AI is temporarily unavailable,',
				body: 'the parts of Sentinel that use fixed rules -- findings, scores, priorities, trends -- are unaffected, since AI is never required to calculate them. Only the optional plain-language explanation is delayed, and you can try again.',
			},
			{
				heading: 'If something goes wrong on a page,',
				body: 'your data is safe — nothing is changed or lost. Sentinel is read-and-recommend by design, which means most failures are display failures, not data failures.',
			},
		],
	},
];

export default function TrustPage() {
	return (
		<section className="py-24 sm:py-32">
			<Container>
				<PageHeader
					eyebrow="Trust Center"
					title="Would you connect your customer data? Here's exactly what happens if you do."
					description="No sales call required. This is the same standard Sentinel holds itself to for every customer, including ones already using it."
				/>

				<div className="mx-auto mt-16 max-w-3xl space-y-16">
					{sections.map(section => {
						const Icon = section.icon;

						return (
							<div key={section.title}>
								<div className="flex items-center gap-3">
									<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10">
										<Icon className="h-5 w-5 text-brand" aria-hidden="true" />
									</div>
									<h2 className="text-xl font-medium text-foreground">{section.title}</h2>
								</div>

								<div className="mt-6 space-y-5">
									{section.items.map(item => (
										<div
											key={item.heading}
											className="rounded-2xl border border-white/10 bg-card p-6"
										>
											<p className="text-sm font-medium text-foreground">{item.heading}</p>
											<p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
										</div>
									))}
								</div>
							</div>
						);
					})}
				</div>

				<div className="mx-auto mt-16 flex max-w-3xl items-start gap-4 rounded-2xl border border-brand/20 bg-brand/5 p-6">
					<AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
					<p className="text-sm leading-6 text-muted-foreground">
						Have a specific question this page doesn&apos;t answer — about security, data
						residency, or how a particular feature works?{' '}
						<a href="mailto:hello@sentinel.ai" className="font-medium text-brand hover:underline">
							Ask us directly
						</a>
						, we&apos;d rather answer it than have you guess.
					</p>
				</div>

				<div className="mx-auto mt-8 flex max-w-3xl items-start gap-4 rounded-2xl border border-white/10 bg-card p-6">
					<Scale className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
					<p className="text-sm leading-6 text-muted-foreground">
						See how these principles work day to day in the product on the{' '}
						<Link href="/demo" className="font-medium text-brand hover:underline">
							sample workspace
						</Link>
						.
					</p>
				</div>
			</Container>
		</section>
	);
}
