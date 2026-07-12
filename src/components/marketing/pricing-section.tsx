import { Check } from 'lucide-react';
import Link from 'next/link';

import { Container } from './container';

const features = [
	'One connected system',
	'Simple setup',
	'Everything included',
];

export function PricingSection() {
	return (
		<section className="py-24 sm:py-32">
			<Container>
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="font-heading text-3xl text-foreground sm:text-4xl">
						One simple platform.
					</h2>

					<p className="mt-6 text-lg leading-8 text-muted-foreground">
						Everything you need to connect with customers, support your team,
						and keep your business moving.
					</p>
				</div>

				<div className="relative mx-auto mt-16 max-w-md">
					<div
						aria-hidden
						className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-brand/10 blur-2xl"
					/>

					<div className="rounded-3xl border border-white/10 bg-card p-8 shadow-xl shadow-black/30 sm:p-10">
						<h3 className="text-xl font-medium text-foreground">Sentinel</h3>

						<p className="mt-2 text-sm text-muted-foreground">
							Your AI business assistant.
						</p>

						<div className="mt-8 flex items-baseline gap-2">
							<span className="font-heading text-5xl text-foreground">
								$149
							</span>

							<span className="text-muted-foreground">/month</span>
						</div>

						<div className="mt-8 space-y-2 border-y border-white/10 py-6 text-base text-foreground/90">
							<p>Connect with customers.</p>
							<p>Support your team.</p>
							<p>Understand your business.</p>
						</div>

						<ul className="mt-6 space-y-3">
							{features.map(feature => (
								<li key={feature} className="flex items-center gap-3">
									<Check className="h-4 w-4 text-brand" />

									<span className="text-sm text-foreground/90">{feature}</span>
								</li>
							))}
						</ul>

						<p className="mt-8 text-sm text-muted-foreground">
							No complicated setup. No separate tools to manage.
						</p>

						<Link
							href="/signup"
							className="mt-8 flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
						>
							Get Started
						</Link>
					</div>
				</div>
			</Container>
		</section>
	);
}
