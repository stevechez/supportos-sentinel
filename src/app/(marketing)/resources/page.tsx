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
		slug: 'getting-started',
		description:
			'Connect Sentinel to your business and start helping customers in minutes.',
		readTime: '5 min read',
	},
	{
		icon: MessageCircle,
		title: 'Managing conversations',
		slug: 'managing-conversations',
		description:
			'Keep customer questions, leads, and support requests organized in one place.',
		readTime: '4 min read',
	},
	{
		icon: BarChart3,
		title: 'Understanding insights',
		slug: 'understanding-insights',
		description:
			'See what customers are asking, spot opportunities, and understand what needs attention.',
		readTime: '3 min read',
	},
];

export default function DocsPage() {
	return (
		<section className="py-24 sm:py-32">
			<Container>
				<PageHeader
					eyebrow="Resources"
					title="Everything you need to get started with Sentinel."
					description="No technical background needed — just a few quick guides to get you started."
				/>

				<div className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-3">
					{guides.map(guide => {
						const Icon = guide.icon;

						return (
							<Link
								key={guide.title}
								href={`/resources/${guide.slug}`}
								className="group block rounded-2xl border border-white/10 bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:bg-card/80"
							>
								<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10">
									<Icon className="h-5 w-5 text-brand" />
								</div>

								<h2 className="mt-6 text-lg font-medium text-foreground transition-colors group-hover:text-brand">
									{guide.title}
								</h2>

								<p className="mt-2 text-xs font-medium uppercase tracking-wide text-brand">
									{guide.readTime}
								</p>

								<p className="mt-3 text-sm leading-7 text-muted-foreground">
									{guide.description}
								</p>
							</Link>
						);
					})}
				</div>

				<p className="mt-16 text-center text-sm text-muted-foreground">
					Need something specific?{' '}
					<Link
						href="/contact"
						className="font-medium text-brand hover:underline"
					>
						Contact our team
					</Link>
					.
				</p>
			</Container>
		</section>
	);
}
