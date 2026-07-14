import Link from 'next/link';
import { AlertTriangle, CheckCircle2, MessagesSquare, TrendingUp } from 'lucide-react';

import { Container } from '@/components/marketing/container';
import { PageHeader } from '@/components/marketing/page-header';

export const metadata = {
	title: 'See a sample workspace | Sentinel',
	description: 'A guided look at what Sentinel finds, without connecting your own data.',
};

// Phase 16G -- demo / trial mode. A visitor should be able to understand
// Sentinel without connecting their own data. This is deliberately a
// static, read-only sample rather than a live demo tenant: no new
// authentication path, no seeded organization a stranger could sign into
// and modify, no risk to the one real environment this product runs in
// today. "Acme Support" is a clearly-labeled illustrative example, not a
// real organization -- the numbers on this page are examples of the kind
// of thing Sentinel surfaces, not a live query against real data.
const sample = {
	organizationName: 'Acme Support',
	conversationsAnalyzed: 142,
	emergingRisks: 3,
	improvementsCompleted: 2,
	healthScore: 86,
};

const highlights = [
	{
		icon: MessagesSquare,
		title: '142 conversations analyzed',
		description: 'Every customer conversation Sentinel sees becomes a signal it can learn from.',
	},
	{
		icon: TrendingUp,
		title: '3 emerging risks noticed early',
		description: 'Issues increasing in frequency, flagged before they become critical findings.',
	},
	{
		icon: CheckCircle2,
		title: '2 improvements completed',
		description: 'Actions your team already took, with their measured effect on the health score.',
	},
];

export default function DemoPage() {
	return (
		<section className="py-24 sm:py-32">
			<Container>
				<PageHeader
					eyebrow="Sample workspace"
					title={`What Sentinel finds for a team like ${sample.organizationName}`}
					description="A guided example, not your data -- see the kind of thing Sentinel surfaces once it's watching your operation."
				/>

				<div className="mx-auto mt-16 max-w-3xl rounded-3xl border border-white/10 bg-card p-8 sm:p-10">
					<div className="flex items-center justify-between gap-4">
						<div>
							<p className="text-sm text-muted-foreground">Operations health</p>
							<p className="mt-1 font-heading text-4xl text-foreground">{sample.healthScore}</p>
						</div>
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
							<AlertTriangle className="h-5 w-5 text-brand" />
						</div>
					</div>

					<div className="mt-8 grid gap-6 sm:grid-cols-3">
						{highlights.map(item => {
							const Icon = item.icon;
							return (
								<div key={item.title}>
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
										<Icon className="h-5 w-5 text-brand" />
									</div>
									<p className="mt-4 text-sm font-medium text-foreground">{item.title}</p>
									<p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
								</div>
							);
						})}
					</div>
				</div>

				<div className="mt-12 text-center">
					<p className="text-sm text-muted-foreground">
						This is an illustrative example. Connect your own data to see this for your business.
					</p>
					<Link
						href="/signup"
						className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
					>
						Get started
					</Link>
				</div>
			</Container>
		</section>
	);
}
