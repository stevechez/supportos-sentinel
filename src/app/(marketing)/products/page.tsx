import Link from 'next/link';
import { MessageCircle, Headphones, BarChart3, ArrowRight } from 'lucide-react';

import { Container } from '@/components/marketing/container';
import { PageHeader } from '@/components/marketing/page-header';

export const metadata = {
	title: 'Solutions | Sentinel',
	description:
		'One connected system for customer conversations, support, and business insight.',
};

const products = [
	{
		icon: MessageCircle,
		title: 'Connect',
		href: '/products/chatbot',
		tagline: 'Connect with customers',
		description:
			'Turn your website into a helpful first point of contact where customers can ask questions and get answers.',
	},
	{
		icon: Headphones,
		title: 'Support',
		href: '/products/supportos',
		tagline: 'Support your team',
		description:
			'Keep customer conversations organized so your team can respond quickly and stay informed.',
	},
	{
		icon: BarChart3,
		title: 'Insights',
		href: '/products/sentinel',
		tagline: 'Understand your business',
		description:
			'See what customers need, what is happening, and where your business can improve.',
	},
];

export default function ProductsPage() {
	return (
		<section className="py-24 sm:py-32">
			<Container>
				<PageHeader
					eyebrow="Solutions"
					title="One platform. Everything connected."
					description="Not three separate tools — one simple system that grows with your business."
				/>

				<div className="mt-16 grid gap-6 md:grid-cols-3">
					{products.map(product => {
						const Icon = product.icon;

						return (
							<Link
								key={product.title}
								href={product.href}
								className="group rounded-2xl border border-white/10 bg-card p-8 transition-colors hover:border-white/20"
							>
								<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10">
									<Icon className="h-5 w-5 text-brand" />
								</div>

								<h2 className="mt-6 text-lg font-medium text-foreground">
									{product.title}
								</h2>

								<p className="mt-1 text-sm font-medium text-brand">
									{product.tagline}
								</p>

								<p className="mt-4 text-sm leading-7 text-muted-foreground">
									{product.description}
								</p>

								<span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground/90">
									Learn more
									<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
								</span>
							</Link>
						);
					})}
				</div>
			</Container>
		</section>
	);
}
