import { AlertTriangle, ArrowRight, Clock3 } from 'lucide-react';

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
					<AlertTriangle className="h-5 w-5 text-red-500" />

					<div>
						<h2 className="text-lg font-semibold">Critical Findings</h2>

						<p className="text-sm text-muted-foreground">
							Highest priority issues requiring attention
						</p>
					</div>
				</div>
			</div>

			<div className="divide-y">
				{findings.map(finding => (
					<div
						key={finding.id}
						className="cursor-pointer p-5 transition-colors hover:bg-muted/40"
					>
						<div className="mb-3 flex items-start justify-between gap-4">
							<div>
								<h3 className="font-medium leading-6">{finding.title}</h3>

								<div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
									<Clock3 className="h-3.5 w-3.5" />

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

							<button className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
								View Details
								<ArrowRight className="h-4 w-4" />
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function SeverityBadge({ severity }: { severity: Finding['severity'] }) {
	const styles = {
		Critical: 'bg-red-500/10 text-red-600 border-red-500/20',
		High: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
		Medium: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
	};

	return (
		<span
			className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[severity]}`}
		>
			{severity}
		</span>
	);
}
