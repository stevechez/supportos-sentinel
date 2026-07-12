import Link from 'next/link';
import { BarChart3, TrendingUp, Lightbulb } from 'lucide-react';

import { Container } from '@/components/marketing/container';
import { PageHeader } from '@/components/marketing/page-header';

export const metadata = {
	title: 'Business Intelligence | Sentinel',
	description:
		'See what customers need, what is happening, and where your business can improve.',
};

const points = [
	{
		icon: BarChart3,
		title: 'A clear picture',
		description:
			'See what is happening across conversations and support in one simple view.',
	},
	{
		icon: TrendingUp,
		title: 'Trends, not noise',
		description:
			'Sentinel surfaces what is changing and why, instead of a wall of numbers.',
	},
	{
		icon: Lightbulb,
		title: 'Suggestions you can act on',
		description:
			'Understand where your business can improve, in plain language.',
	},
];

export default function SentinelBiPage() {
	return (
		<section className="py-24 sm:py-32">
			<Container>
				<PageHeader
					eyebrow="Business Intelligence"
					title="Understand your business at a glance."
					description="Sentinel turns everyday conversations and support activity into a clear picture of how your business is doing."
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
