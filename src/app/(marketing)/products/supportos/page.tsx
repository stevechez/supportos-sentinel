import Link from 'next/link';
import { Inbox, Users, ShieldCheck } from 'lucide-react';

import { Container } from '@/components/marketing/container';
import { PageHeader } from '@/components/marketing/page-header';

export const metadata = {
	title: 'SupportOS | Sentinel',
	description:
		'Keep customer conversations organized so your team can respond quickly.',
};

const points = [
	{
		icon: Inbox,
		title: 'One shared inbox',
		description:
			'Every conversation lives in one place, so nothing gets lost across tools.',
	},
	{
		icon: Users,
		title: 'Everyone stays informed',
		description:
			'Your whole team can see context instantly, without asking around first.',
	},
	{
		icon: ShieldCheck,
		title: 'Nothing falls through',
		description:
			'Sentinel keeps track of what needs a response, and gently nudges when something is waiting.',
	},
];

export default function SupportOsPage() {
	return (
		<section className="py-24 sm:py-32">
			<Container>
				<PageHeader
					eyebrow="SupportOS"
					title="Support your team without the chaos."
					description="Customer conversations, organized and easy to follow — so your team can respond quickly and confidently."
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
