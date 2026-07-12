import { ArrowDownRight, ArrowUpRight, HeartPulse } from 'lucide-react';

interface HealthScoreCardProps {
	score?: number;
	previousScore?: number;
}

export function HealthScoreCard({
	score = 82,
	previousScore = 86,
}: HealthScoreCardProps) {
	const delta = score - previousScore;

	const isPositive = delta >= 0;

	return (
		<div className="rounded-xl border bg-card p-8 shadow-sm">
			<div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
				{/* Left Side */}
				<div className="space-y-3">
					<div className="flex items-center gap-2 text-muted-foreground">
						<HeartPulse className="h-5 w-5" />
						<span className="text-sm font-medium tracking-wide uppercase">
							Overall Operations Health
						</span>
					</div>

					<div className="flex items-end gap-4">
						<span className="text-6xl font-bold tracking-tight">{score}</span>

						<span className="pb-2 text-xl text-muted-foreground">/100</span>
					</div>

					<div
						className={`flex items-center gap-2 text-sm font-medium ${
							isPositive ? 'text-emerald-400' : 'text-destructive'
						}`}
					>
						{isPositive ? (
							<ArrowUpRight className="h-4 w-4" />
						) : (
							<ArrowDownRight className="h-4 w-4" />
						)}
						{Math.abs(delta)} points since last report
					</div>
				</div>

				{/* Right Side */}
				<div className="grid w-full gap-5 lg:max-w-md">
					<HealthMetric label="Technical Health" value={91} />

					<HealthMetric label="Knowledge Base" value={79} />

					<HealthMetric label="Customer Experience" value={84} />

					<HealthMetric label="Agent Quality" value={88} />
				</div>
			</div>
		</div>
	);
}

interface HealthMetricProps {
	label: string;
	value: number;
}

function HealthMetric({ label, value }: HealthMetricProps) {
	return (
		<div className="space-y-2">
			<div className="flex justify-between text-sm">
				<span className="text-muted-foreground">{label}</span>

				<span className="font-semibold">{value}%</span>
			</div>

			<div className="h-2 overflow-hidden rounded-full bg-muted">
				<div
					className="h-full rounded-full bg-primary transition-all"
					style={{
						width: `${value}%`,
					}}
				/>
			</div>
		</div>
	);
}
