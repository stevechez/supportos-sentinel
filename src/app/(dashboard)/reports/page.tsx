import {
	ArrowUpRight,
	CheckCircle2,
	ClipboardList,
	TrendingUp,
} from 'lucide-react';

import { Container } from '@/components/marketing/container';

const insights = [
	{
		title: 'Customer satisfaction is improving',
		description:
			'Customers are receiving faster responses and more conversations are being resolved successfully.',
		icon: TrendingUp,
	},
	{
		title: 'Pricing clarity remains an opportunity',
		description:
			'Customers continue asking similar pricing questions. More information may reduce confusion.',
		icon: ClipboardList,
	},
	{
		title: 'Support conversations are healthy',
		description: 'Most customer requests are being handled successfully.',
		icon: CheckCircle2,
	},
];

export default function ReportsPage() {
	return (
		<section className="py-10">
			<Container>
				<div className="max-w-3xl">
					<p className="text-sm font-medium uppercase tracking-wide text-brand">
						Reports
					</p>

					<h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
						Your business health at a glance
					</h1>

					<p className="mt-4 text-muted-foreground">
						Sentinel turns customer activity into simple reports so you always
						understand what is happening.
					</p>
				</div>

				<div className="mt-10 grid gap-4 md:grid-cols-3">
					<div className="rounded-2xl border border-border bg-card p-6">
						<p className="text-sm text-muted-foreground">Business Health</p>

						<p className="mt-3 text-4xl font-semibold">94</p>

						<p className="mt-2 text-sm text-brand">Excellent</p>
					</div>

					<div className="rounded-2xl border border-border bg-card p-6">
						<p className="text-sm text-muted-foreground">
							Customer Conversations
						</p>

						<p className="mt-3 text-4xl font-semibold">128</p>

						<p className="mt-2 inline-flex items-center gap-1 text-sm text-brand">
							<ArrowUpRight className="h-4 w-4" />
							12% this month
						</p>
					</div>

					<div className="rounded-2xl border border-border bg-card p-6">
						<p className="text-sm text-muted-foreground">Resolved Requests</p>

						<p className="mt-3 text-4xl font-semibold">96%</p>

						<p className="mt-2 text-sm text-brand">Excellent performance</p>
					</div>
				</div>

				<div className="mt-10 rounded-2xl border border-border bg-card p-8">
					<h2 className="text-xl font-semibold text-foreground">
						Weekly Business Health Report
					</h2>

					<p className="mt-3 text-sm leading-7 text-muted-foreground">
						Customer conversations are healthy. Response times have improved,
						and customers are getting answers faster. The biggest opportunity is
						providing clearer pricing information.
					</p>
				</div>

				<div className="mt-8 space-y-5">
					<h2 className="text-xl font-semibold text-foreground">
						Key insights
					</h2>

					{insights.map(item => {
						const Icon = item.icon;

						return (
							<div
								key={item.title}
								className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand/30"
							>
								<div className="flex gap-4">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
										<Icon className="h-5 w-5 text-brand" />
									</div>

									<div>
										<h3 className="font-medium text-foreground">
											{item.title}
										</h3>

										<p className="mt-2 text-sm leading-6 text-muted-foreground">
											{item.description}
										</p>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</Container>
		</section>
	);
}
