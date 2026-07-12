import { MessageCircle, Headphones, BarChart3 } from 'lucide-react';

import { Container } from './container';

const capabilities = [
	{
		icon: MessageCircle,
		title: 'Connect with customers',
		product: 'ChatWidget',
		description:
			'Turn your website into a helpful first point of contact where customers can ask questions and get answers.',
	},
	{
		icon: Headphones,
		title: 'Support your team',
		product: 'SupportOS',
		description:
			'Keep customer conversations organized so your team can respond quickly and stay informed.',
	},
	{
		icon: BarChart3,
		title: 'Understand your business',
		product: 'Sentinel',
		description:
			'See what customers need, what is happening, and where your business can improve.',
	},
];

export function EcosystemSection() {
	return (
		<section className="border-y border-white/10 bg-white/[0.015] py-24 sm:py-32">
			<Container>
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="font-heading text-3xl text-foreground sm:text-4xl">
						One platform.
						<br />
						Everything connected.
					</h2>

					<p className="mt-6 text-lg leading-8 text-muted-foreground">
						Sentinel brings customer conversations, support, and business
						insights together in one simple experience.
					</p>
				</div>

				<div className="mt-16 grid gap-6 md:grid-cols-3">
					{capabilities.map(item => {
						const Icon = item.icon;

						return (
							<div
								key={item.product}
								className="rounded-2xl border border-white/10 bg-card p-8 transition-colors hover:border-white/20"
							>
								<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10">
									<Icon className="h-5 w-5 text-brand" />
								</div>

								<h3 className="mt-6 text-lg font-medium text-foreground">
									{item.title}
								</h3>

								<p className="mt-2 text-sm font-medium text-brand">
									{item.product}
								</p>

								<p className="mt-4 text-sm leading-7 text-muted-foreground">
									{item.description}
								</p>
							</div>
						);
					})}
				</div>

				<div className="mt-16 text-center">
					<p className="text-lg font-medium text-foreground/90">
						Not three separate tools.
						<br />
						One connected system.
					</p>
				</div>
			</Container>
		</section>
	);
}
