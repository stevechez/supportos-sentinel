import Link from 'next/link';
import { Rocket, MessageCircle, BarChart3 } from 'lucide-react';

import { Container } from '@/components/marketing/container';
import { PageHeader } from '@/components/marketing/page-header';

export const metadata = {
	title: 'Resources | Sentinel',
	description: 'Guides for getting the most out of Sentinel.',
};

const guides = [
	{
		icon: Rocket,
		title: 'Getting started',
		description: 'Connect Sentinel to your business in a few minutes.',
	},
	{
		icon: MessageCircle,
		title: 'Managing conversations',
		description: 'Keep customer questions and support requests organized.',
	},
	{
		icon: BarChart3,
		title: 'Understanding your insights',
		description: 'Make sense of what your customers need and where to improve.',
	},
];

export default function DocsPage() {
	return (
		<section className="py-24 sm:py-32">
			<Container>
				<PageHeader
					eyebrow="Resources"
					title="Guides to help you get the most out of Sentinel."
					description="No technical background needed — just a few short guides to help things click."
				/>

				<div className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-3">
					{guides.map(guide => {
						const Icon = guide.icon;

						return (
							<div
								key={guide.title}
								className="rounded-2xl border border-white/10 bg-card p-8"
							>
								<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10">
									<Icon className="h-5 w-5 text-brand" />
								</div>

								<h2 className="mt-6 text-lg font-medium text-foreground">
									{guide.title}
								</h2>

								<p className="mt-3 text-sm leading-7 text-muted-foreground">
									{guide.description}
								</p>
							</div>
						);
					})}
				</div>

				<p className="mt-16 text-center text-sm text-muted-foreground">
					Need something specific?{' '}
					<Link href="/contact" className="font-medium text-brand hover:underline">
						Contact our team
					</Link>
					.
				</p>
			</Container>
		</section>
	);
}
