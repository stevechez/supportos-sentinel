import Link from 'next/link';

import { Container } from '@/components/marketing/container';
import { PageHeader } from '@/components/marketing/page-header';

export const metadata = {
	title: 'FAQ | Sentinel',
	description: 'Setup, reliability, and troubleshooting answers for first-time customers.',
};

// Phase 17G -- support readiness. The specific reliability questions the
// handoff names ("if sync fails, what happens?", "if AI is unavailable?",
// "how do I connect my data?") answered publicly, plus the setup basics.
// Deliberately plain Q&A, not a searchable help center -- that's the right
// amount of infrastructure for a product about to get its first customers,
// not its thousandth.
const faqs = [
	{
		question: 'How do I connect my data?',
		answer:
			'From your dashboard, click "Connect SupportOS" (or "Sync Now" if you\'ve connected before). That single click reads your existing support tickets and conversations and turns them into signals Sentinel can analyze — there\'s no separate setup step, no API keys to paste in, and no technical configuration.',
	},
	{
		question: 'What happens if a sync fails?',
		answer:
			'Your Connected Sources card shows the connection as needing attention rather than silently going stale. Nothing else in your dashboard is affected — you keep seeing every insight already generated from data that did sync successfully, and you can retry the sync at any time.',
	},
	{
		question: 'What happens if AI is unavailable?',
		answer:
			'Findings, health scores, priorities, and trends are all calculated using fixed rules, not AI — so they keep working normally even if the AI explanation service is down. The only thing affected is the optional plain-language "Explain this" feature, which you can simply try again later.',
	},
	{
		question: 'Do I need technical expertise to set this up?',
		answer:
			'No. Signing up creates your workspace automatically from your business name — there\'s no separate "create an organization" step. Connecting a source is one click. If you can use a web form, you can set up Sentinel.',
	},
	{
		question: 'How is my data kept separate from other customers?',
		answer:
			'Every row of data is scoped to your organization at the database level, not just filtered in the app. See the full breakdown on the Trust Center.',
	},
	{
		question: 'Can I try Sentinel before connecting my own data?',
		answer:
			'Yes — the sample workspace walks through a real example end to end without requiring an account.',
	},
	{
		question: 'What if I get stuck?',
		answer:
			'Email hello@sentinel.ai for general setup questions — a person reads and answers these, not a bot. See the Contact page for account-specific help.',
	},
	{
		question: 'How does billing work?',
		answer:
			'Plans are monthly, shown in full on the Pricing page. If you sign up before a plan is selected, you land straight in the product — you can subscribe from Pricing whenever you\'re ready, nothing is blocked.',
	},
];

export default function FaqPage() {
	return (
		<section className="py-24 sm:py-32">
			<Container>
				<PageHeader
					eyebrow="FAQ"
					title="Setup, reliability, and what happens if something goes wrong."
					description="The specific questions people ask before connecting their first source."
				/>

				<div className="mx-auto mt-16 max-w-2xl space-y-4">
					{faqs.map(faq => (
						<div key={faq.question} className="rounded-2xl border border-white/10 bg-card p-6">
							<h2 className="text-base font-medium text-foreground">{faq.question}</h2>
							<p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
						</div>
					))}
				</div>

				<div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-white/10 bg-card/60 p-6 text-center">
					<p className="text-sm text-muted-foreground">
						Didn&apos;t find your answer? See the{' '}
						<Link href="/trust" className="font-medium text-brand hover:underline">
							Trust Center
						</Link>{' '}
						for data and AI questions, or{' '}
						<Link href="/contact" className="font-medium text-brand hover:underline">
							contact us
						</Link>{' '}
						directly.
					</p>
				</div>
			</Container>
		</section>
	);
}
