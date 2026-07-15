import Link from 'next/link';
import {
	AlertTriangle,
	BookOpenCheck,
	Brain,
	CheckCircle2,
	KeyRound,
	MessagesSquare,
	TrendingDown,
	TrendingUp,
} from 'lucide-react';

import { Container } from '@/components/marketing/container';
import { PageHeader } from '@/components/marketing/page-header';

export const metadata = {
	title: 'See a sample workspace | Sentinel',
	description:
		'A walk through the actual loop Sentinel runs: a recurring issue is noticed, a fix is made, and Sentinel remembers whether it worked.',
};

// Phase 16G built a static sample page with numbers but no story. Phase
// 17E rewrites it around the actual value loop from the Phase 17 handoff:
// recurring issue detected -> finding created -> documentation improved ->
// tickets reduced -> Sentinel remembers. Still deliberately a static,
// read-only page rather than a live demo tenant, for the same reason as
// before: no new auth path, no seeded organization a stranger could sign
// into and modify, no risk to the one real environment this runs in today.
// "Acme Support" is a clearly-labeled illustrative example throughout.
const sample = {
	organizationName: 'Acme Support',
};

const story = [
	{
		icon: MessagesSquare,
		step: '1. Sentinel notices a pattern',
		title: 'A recurring password issue is detected',
		description:
			'12 separate conversations over one week all trace back to the same thing: customers can’t find where to reset their password. No single conversation looked urgent — the pattern only shows up once Sentinel groups them.',
	},
	{
		icon: AlertTriangle,
		step: '2. A finding is created',
		title: '"Repeated password reset confusion" becomes a finding',
		description:
			'Sentinel turns the pattern into a specific, named finding with the evidence behind it — not a vague alert, something a support lead can act on the same day.',
	},
	{
		icon: BookOpenCheck,
		step: '3. Documentation is improved',
		title: 'The team updates the password reset help article',
		description:
			'Acme’s support lead reviews Sentinel’s recommendation, rewrites the confusing step, and marks the finding as resolved — a normal decision a human made, not something Sentinel did automatically.',
	},
	{
		icon: TrendingDown,
		step: '4. Tickets are reduced',
		title: 'Password reset questions drop the following week',
		description:
			'The same pattern Sentinel was watching now shows fewer conversations, not more — measurable, not just assumed.',
	},
	{
		icon: Brain,
		step: '5. Sentinel remembers',
		title: 'The next similar issue gets matched to this one',
		description:
			'Months later, a different but related pattern shows up. Sentinel surfaces this exact resolution as a past result — what worked before, not a fresh guess.',
	},
];

const highlights = [
	{
		icon: MessagesSquare,
		title: '142 conversations analyzed',
		description: 'Every customer conversation Sentinel sees becomes something it can learn from.',
	},
	{
		icon: TrendingUp,
		title: '3 emerging risks noticed early',
		description: 'Issues increasing in frequency, flagged before they become critical findings.',
	},
	{
		icon: CheckCircle2,
		title: '2 improvements completed',
		description: 'Actions the team already took, with their measured effect on the health score.',
	},
];

export default function DemoPage() {
	return (
		<section className="py-24 sm:py-32">
			<Container>
				<PageHeader
					eyebrow="Sample workspace"
					title={`How Sentinel helped a team like ${sample.organizationName}`}
					description="A walk through one real loop -- issue noticed, fix made, result measured -- using an illustrative example, not your data."
				/>

				<div className="mx-auto mt-16 max-w-2xl space-y-6">
					{story.map(item => {
						const Icon = item.icon;
						return (
							<div key={item.step} className="flex gap-5 rounded-2xl border border-white/10 bg-card p-6">
								<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10">
									<Icon className="h-5 w-5 text-brand" aria-hidden="true" />
								</div>
								<div>
									<p className="text-xs font-medium tracking-wide text-brand">{item.step}</p>
									<h2 className="mt-1.5 text-base font-medium text-foreground">{item.title}</h2>
									<p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
								</div>
							</div>
						);
					})}
				</div>

				<div className="mx-auto mt-16 max-w-3xl rounded-3xl border border-white/10 bg-card p-8 sm:p-10">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
							<KeyRound className="h-5 w-5 text-brand" aria-hidden="true" />
						</div>
						<p className="text-sm text-muted-foreground">
							What the rest of {sample.organizationName}&apos;s workspace looked like that week
						</p>
					</div>

					<div className="mt-8 grid gap-6 sm:grid-cols-3">
						{highlights.map(item => {
							const Icon = item.icon;
							return (
								<div key={item.title}>
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
										<Icon className="h-5 w-5 text-brand" aria-hidden="true" />
									</div>
									<p className="mt-4 text-sm font-medium text-foreground">{item.title}</p>
									<p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
								</div>
							);
						})}
					</div>
				</div>

				<div className="mt-12 text-center">
					<p className="text-sm text-muted-foreground">
						This is an illustrative example. Connect your own data to see this for your business.
					</p>
					<Link
						href="/signup"
						className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
					>
						Get started
					</Link>
				</div>
			</Container>
		</section>
	);
}
