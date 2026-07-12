import { MessageCircle, Headphones, BarChart3 } from 'lucide-react';

import { Container } from '@/components/marketing/container';
import { PageHeader } from '@/components/marketing/page-header';

export const metadata = {
	title: 'What’s Included | Sentinel',
	description:
		'Everything included in Sentinel — connect with customers, support your team, and understand your business.',
};

const capabilities = [
	{
		icon: MessageCircle,
		title: 'Connect with customers',
		product: 'ChatWidget',
		description:
			'Turn your website into a helpful first point of contact where customers can ask questions and get answers, any time of day.',
	},
	{
		icon: Headphones,
		title: 'Support your team',
		product: 'SupportOS',
		description:
			'Keep customer conversations organized in one place so your team can respond quickly, stay informed, and never lose track of a request.',
	},
	{
		icon: BarChart3,
		title: 'Understand your business',
		product: 'Business Intelligence',
		description:
			'See what customers need, what is happening across your business, and where things can improve — without digging through reports.',
	},
];

export default function FeaturesPage() {
	return (
		<section className="py-24 sm:py-32">
			<Container>
				<PageHeader
					eyebrow="What's included"
					title="Everything you need, already connected."
					description="Sentinel isn't three separate products. It's one system that grows with your business."
				/>

				<div className="mt-16 space-y-6">
					{capabilities.map(item => {
						const Icon = item.icon;

						return (
							<div
								key={item.product}
								className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-card p-8 sm:flex-row sm:items-start"
							>
								<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10">
									<Icon className="h-5 w-5 text-brand" />
								</div>

								<div>
									<h2 className="text-lg font-medium text-foreground">
										{item.title}
									</h2>

									<p className="mt-1 text-sm font-medium text-brand">
										{item.product}
									</p>

									<p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
										{item.description}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			</Container>
		</section>
	);
}
