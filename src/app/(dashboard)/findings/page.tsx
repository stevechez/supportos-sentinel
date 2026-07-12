import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

import { Container } from '@/components/marketing/container';

const findings = [
	{
		title: 'Customer response times increased',
		description:
			'Customers are waiting longer than usual for responses. Faster replies may improve customer satisfaction.',
		priority: 'High',
		status: 'Needs attention',
		icon: AlertTriangle,
	},
	{
		title: 'Customers frequently ask about pricing',
		description:
			'Several conversations include questions about pricing and service details.',
		priority: 'Medium',
		status: 'Opportunity',
		icon: Info,
	},
	{
		title: 'Customer conversations are healthy',
		description:
			'Most conversations are being resolved quickly with positive outcomes.',
		priority: 'Low',
		status: 'Healthy',
		icon: CheckCircle2,
	},
];

export default function FindingsPage() {
	return (
		<section className="py-10">
			<Container>
				<div className="max-w-3xl">
					<p className="text-sm font-medium uppercase tracking-wide text-brand">
						Findings
					</p>

					<h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
						What Sentinel noticed
					</h1>

					<p className="mt-4 text-muted-foreground">
						Sentinel monitors your customer conversations and highlights
						important things that may need your attention.
					</p>
				</div>

				<div className="mt-10 space-y-5">
					{findings.map(finding => {
						const Icon = finding.icon;

						return (
							<div
								key={finding.title}
								className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand/30"
							>
								<div className="flex items-start gap-4">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
										<Icon className="h-5 w-5 text-brand" />
									</div>

									<div className="flex-1">
										<div className="flex flex-col justify-between gap-2 sm:flex-row">
											<h2 className="font-medium text-foreground">
												{finding.title}
											</h2>

											<span className="text-sm text-muted-foreground">
												{finding.priority}
											</span>
										</div>

										<p className="mt-2 text-sm leading-6 text-muted-foreground">
											{finding.description}
										</p>

										<p className="mt-4 text-xs font-medium uppercase tracking-wide text-brand">
											{finding.status}
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
