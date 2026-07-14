import Link from 'next/link';
import { CheckCircle2, Lock, Scale, Sparkles } from 'lucide-react';

import { Container } from '@/components/marketing/container';

// Phase 17F -- previously an orphaned component (built, never rendered).
// Rewritten so its three claims are the specific, checkable ones a stranger
// deciding whether to connect their customer data actually needs answered,
// not general brand copy. Same language as the in-app Settings "AI usage &
// trust" section (Phase 16D) -- what's true behind login should be the same
// thing said before login.
const principles = [
	{
		icon: Sparkles,
		title: 'AI assists. It doesn’t decide.',
		description:
			'Every finding, score, and priority Sentinel shows you is calculated by deterministic rules first. AI is only ever asked to explain a conclusion Sentinel already reached — it never creates a finding or sets a priority on its own.',
	},
	{
		icon: Scale,
		title: 'Humans decide.',
		description:
			'Sentinel surfaces patterns and recommends next steps. Your team reviews, decides, and acts — nothing changes in your operation automatically.',
	},
	{
		icon: Lock,
		title: 'Your data stays yours.',
		description:
			'Your organization’s conversations and signals are isolated from every other customer’s. Your data is only ever used to produce your organization’s own insights.',
	},
];

export function TrustSection() {
	return (
		<section className="py-24 sm:py-32">
			<Container>
				<div className="mx-auto max-w-3xl text-center">
					<p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
						Trust
					</p>

					<h2 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
						Would you connect your customer data? Here&apos;s exactly what happens if you do.
					</h2>

					<p className="mt-6 text-lg leading-8 text-muted-foreground">
						Sentinel watches your customer conversations to find patterns —
						here&apos;s where AI is involved, where it isn&apos;t, and where
						your data goes.
					</p>
				</div>

				<div className="mt-20 grid gap-8 lg:grid-cols-3">
					{principles.map(principle => {
						const Icon = principle.icon;

						return (
							<div
								key={principle.title}
								className="group rounded-3xl border border-border bg-card/40 p-8 transition-all duration-300 hover:border-brand/30 hover:bg-card"
							>
								<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10">
									<Icon className="h-6 w-6 text-brand" />
								</div>

								<h3 className="mt-6 text-xl font-semibold text-foreground">
									{principle.title}
								</h3>

								<p className="mt-4 leading-7 text-muted-foreground">
									{principle.description}
								</p>
							</div>
						);
					})}
				</div>

				<div className="mx-auto mt-20 max-w-5xl rounded-3xl border border-brand/20 bg-brand/5 p-10">
					<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
						<div>
							<h3 className="text-2xl font-semibold text-foreground">
								Read the full trust center.
							</h3>

							<p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
								AI principles, how your data is isolated, and what happens if a
								connection or AI explanation fails — all in one place.
							</p>
						</div>

						<Link
							href="/trust"
							className="flex shrink-0 items-center gap-3 rounded-2xl border border-border bg-background px-5 py-4 transition-colors hover:border-brand/40"
						>
							<CheckCircle2 className="h-5 w-5 text-brand" />

							<span className="font-medium text-foreground">
								Visit the Trust Center
							</span>
						</Link>
					</div>
				</div>
			</Container>
		</section>
	);
}
