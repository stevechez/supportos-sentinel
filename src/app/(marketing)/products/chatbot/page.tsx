import Link from 'next/link';
import { MessageCircle, Clock, Sparkles } from 'lucide-react';

import { Container } from '@/components/marketing/container';
import { PageHeader } from '@/components/marketing/page-header';

export const metadata = {
	title: 'ChatWidget | Sentinel',
	description:
		'Turn your website into a helpful first point of contact for customers.',
};

const points = [
	{
		icon: Clock,
		title: 'Always available',
		description:
			'Customers get an answer the moment they ask — no waiting for business hours.',
	},
	{
		icon: MessageCircle,
		title: 'Feels like your business',
		description:
			'Conversations are grounded in your business, not generic scripted replies.',
	},
	{
		icon: Sparkles,
		title: 'Handed off when it matters',
		description:
			'Sentinel knows when a conversation needs a person, and brings your team in smoothly.',
	},
];

export default function ChatbotPage() {
	return (
		<section className="py-24 sm:py-32">
			<Container>
				<PageHeader
					eyebrow="ChatWidget"
					title="Connect with customers, the moment they land."
					description="A simple widget on your website that turns visitors' questions into conversations — and conversations into customers."
				/>

				<div className="mt-16 grid gap-6 md:grid-cols-3">
					{points.map(point => {
						const Icon = point.icon;

						return (
							<div
								key={point.title}
								className="rounded-2xl border border-white/10 bg-card p-8"
							>
								<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10">
									<Icon className="h-5 w-5 text-brand" />
								</div>

								<h2 className="mt-6 text-lg font-medium text-foreground">
									{point.title}
								</h2>

								<p className="mt-3 text-sm leading-7 text-muted-foreground">
									{point.description}
								</p>
							</div>
						);
					})}
				</div>

				<div className="mt-16 text-center">
					<Link
						href="/signup"
						className="rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
					>
						Get Started
					</Link>
				</div>
			</Container>
		</section>
	);
}
