import { AlertTriangle, ArrowRight, Clock3, ShieldCheck } from 'lucide-react';

import { EmptyState } from './empty-state';

interface Finding {
	id: number;
	title: string;
	severity: 'Critical' | 'High' | 'Medium';
	confidence: number;
	detected: string;
}

const findings: Finding[] = [
	{
		id: 1,
		title: 'Checkout payment failures increased 42%',
		severity: 'Critical',
		confidence: 94,
		detected: '18 minutes ago',
	},
	{
		id: 2,
		title: 'Refund requests increasing after deployment',
		severity: 'High',
		confidence: 88,
		detected: '1 hour ago',
	},
	{
		id: 3,
		title: 'Missing cancellation policy documentation',
		severity: 'Medium',
		confidence: 91,
		detected: 'Today',
	},
];

export function CriticalFindingsCard() {
	return (
		<div className="rounded-xl border bg-card shadow-sm">
			<div className="flex items-center justify-between border-b px-6 py-4">
				<div className="flex items-center gap-2">
					<AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />

					<div>
						<h2 className="font-heading text-lg text-foreground">
							Critical Findings
						</h2>

						<p className="text-sm text-muted-foreground">
							Highest priority issues requiring attention
						</p>
					</div>
				</div>
			</div>

			{findings.length === 0 ? (
				<EmptyState
					icon={ShieldCheck}
					title="No critical findings"
					description="Sentinel hasn't detected any high-priority issues. You'll see them here as soon as they come up."
				/>
			) : (
				<div className="divide-y">
					{findings.map(finding => (
						<div key={finding.id} className="p-5 transition-colors hover:bg-muted/40">
							<div className="mb-3 flex items-start justify-between gap-4">
								<div>
									<h3 className="font-medium leading-6">{finding.title}</h3>

									<div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
										<Clock3 className="h-3.5 w-3.5" aria-hidden="true" />

										{finding.detected}
									</div>
								</div>

								<SeverityBadge severity={finding.severity} />
							</div>

							<div className="flex items-center justify-between">
								<div className="text-sm text-muted-foreground">
									Confidence{' '}
									<span className="font-semibold text-foreground">
										{finding.confidence}%
									</span>
								</div>

								<button
									type="button"
									className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
								>
									View Details
									<span className="sr-only">for {finding.title}</span>
									<ArrowRight className="h-4 w-4" aria-hidden="true" />
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function SeverityBadge({ severity }: { severity: Finding['severity'] }) {
	const styles = {
		Critical: 'bg-destructive/10 text-destructive border-destructive/20',
		High: 'bg-destructive/10 text-destructive border-destructive/20',
		Medium: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
	};

	return (
		<span
			className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[severity]}`}
		>
			{severity}
		</span>
	);
}
