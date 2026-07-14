import { Check } from 'lucide-react';
import Link from 'next/link';

import { Container } from './container';
import { Reveal } from './reveal';

// Phase 17D -- pricing model foundation. This is intentionally a
// positioning device, not a new billing system: the app still has exactly
// one real Stripe price (`STRIPE_PRICE_ID`), created in the existing
// signup/login flow, and that's still what "Get started" leads to. What
// was missing wasn't more billing plumbing -- it was a way for a stranger
// to size themselves against the product before signing up. Growth is
// marked as "what most teams choose" because it maps to the one real
// price point that already exists; Starter and Enterprise are the
// placeholder framing the Phase 17 handoff explicitly says is acceptable
// ("do not implement complex billing unless the existing Stripe foundation
// requires it" -- it doesn't, yet).
const tiers = [
	{
		name: 'Starter',
		description: 'Small support teams getting their first operational insight.',
		price: '$49',
		cta: 'Get started',
		href: '/signup',
		highlighted: false,
		features: [
			'1 connected source',
			'Recurring issue detection',
			'Weekly health score',
		],
	},
	{
		name: 'Growth',
		description: 'Growing teams who want to act on what Sentinel finds.',
		price: '$199',
		cta: 'Get started',
		href: '/signup',
		highlighted: true,
		features: [
			'Unlimited connected sources',
			'Emerging risk detection',
			'Organizational memory & track record',
			'Full team access',
		],
	},
	{
		name: 'Enterprise',
		description: 'Custom needs, custom rollout.',
		price: 'Custom',
		cta: 'Talk to sales',
		href: '/contact',
		highlighted: false,
		features: [
			'Everything in Growth',
			'Guided onboarding',
			'Dedicated support',
		],
	},
];

export function PricingSection() {
	return (
		<section className="py-24 sm:py-32">
			<Container>
				<Reveal className="mx-auto max-w-2xl text-center">
					<h2 className="font-heading text-3xl text-foreground sm:text-4xl">
						Simple pricing, sized to your team.
					</h2>

					<p className="mt-6 text-lg leading-8 text-muted-foreground">
						Every plan includes the same core promise: find recurring issues,
						and help your team continuously improve.
					</p>
				</Reveal>

				<div className="mt-16 grid gap-6 lg:grid-cols-3 lg:items-start">
					{tiers.map((tier, index) => (
						<Reveal key={tier.name} delay={index * 80} className="relative h-full">
							{tier.highlighted && (
								<div
									aria-hidden
									className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-brand/10 blur-2xl"
								/>
							)}

							<div
								className={`flex h-full flex-col rounded-3xl border p-8 ${
									tier.highlighted
										? 'border-brand/40 bg-card shadow-xl shadow-black/30'
										: 'border-white/10 bg-card/60'
								}`}
							>
								{tier.highlighted && (
									<span className="mb-4 inline-block w-fit rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
										Most teams choose this
									</span>
								)}

								<h3 className="text-xl font-medium text-foreground">{tier.name}</h3>

								<p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>

								<div className="mt-8 flex items-baseline gap-2">
									<span className="font-heading text-4xl text-foreground">{tier.price}</span>
									{tier.price !== 'Custom' && <span className="text-muted-foreground">/month</span>}
								</div>

								<ul className="mt-8 flex-1 space-y-3 border-t border-white/10 pt-6">
									{tier.features.map(feature => (
										<li key={feature} className="flex items-center gap-3">
											<Check className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
											<span className="text-sm text-foreground/90">{feature}</span>
										</li>
									))}
								</ul>

								<Link
									href={tier.href}
									className={`mt-8 flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90 ${
										tier.highlighted
											? 'bg-primary text-primary-foreground'
											: 'border border-white/15 text-foreground'
									}`}
								>
									{tier.cta}
								</Link>
							</div>
						</Reveal>
					))}
				</div>

				<p className="mt-10 text-center text-sm text-muted-foreground">
					No complicated setup. No separate tools to manage.
				</p>
			</Container>
		</section>
	);
}
