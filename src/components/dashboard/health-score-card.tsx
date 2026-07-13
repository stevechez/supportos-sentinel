'use client';

import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, HeartPulse } from 'lucide-react';

interface HealthScoreCardProps {
	score?: number;
	previousScore?: number;
}

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function HealthScoreCard({
	score = 82,
	previousScore = 86,
}: HealthScoreCardProps) {
	const delta = score - previousScore;
	const isPositive = delta >= 0;

	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const frame = requestAnimationFrame(() => setMounted(true));
		return () => cancelAnimationFrame(frame);
	}, []);

	const offset = CIRCUMFERENCE - (mounted ? score : 0) / 100 * CIRCUMFERENCE;

	return (
		<div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
			<div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
				{/* Left Side */}
				<div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
					<div
						className="relative flex h-32 w-32 shrink-0 items-center justify-center"
						role="progressbar"
						aria-label="Overall operations health score"
						aria-valuenow={score}
						aria-valuemin={0}
						aria-valuemax={100}
					>
						<svg viewBox="0 0 128 128" className="h-32 w-32 -rotate-90">
							<circle
								cx="64"
								cy="64"
								r={RADIUS}
								fill="none"
								strokeWidth="10"
								className="stroke-muted"
							/>
							<circle
								cx="64"
								cy="64"
								r={RADIUS}
								fill="none"
								strokeWidth="10"
								strokeLinecap="round"
								className="stroke-brand transition-[stroke-dashoffset] duration-1000 ease-out motion-reduce:transition-none"
								strokeDasharray={CIRCUMFERENCE}
								strokeDashoffset={offset}
							/>
						</svg>

						<div className="absolute flex flex-col items-center">
							<span className="text-3xl font-bold tracking-tight">{score}</span>
							<span className="text-xs text-muted-foreground">/100</span>
						</div>
					</div>

					<div className="space-y-3">
						<div className="flex items-center gap-2 text-muted-foreground">
							<HeartPulse className="h-5 w-5" aria-hidden="true" />
							<span className="text-sm font-medium tracking-wide uppercase">
								Overall Operations Health
							</span>
						</div>

						<div
							className={`flex items-center gap-2 text-sm font-medium ${
								isPositive ? 'text-emerald-400' : 'text-destructive'
							}`}
						>
							{isPositive ? (
								<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
							) : (
								<ArrowDownRight className="h-4 w-4" aria-hidden="true" />
							)}
							{Math.abs(delta)} points since last report
						</div>
					</div>
				</div>

				{/* Right Side */}
				<div className="grid w-full gap-5 lg:max-w-md">
					<HealthMetric label="Technical Health" value={91} mounted={mounted} />
					<HealthMetric label="Knowledge Base" value={79} mounted={mounted} />
					<HealthMetric
						label="Customer Experience"
						value={84}
						mounted={mounted}
					/>
					<HealthMetric label="Agent Quality" value={88} mounted={mounted} />
				</div>
			</div>
		</div>
	);
}

interface HealthMetricProps {
	label: string;
	value: number;
	mounted: boolean;
}

function HealthMetric({ label, value, mounted }: HealthMetricProps) {
	return (
		<div className="space-y-2">
			<div className="flex justify-between text-sm">
				<span className="text-muted-foreground">{label}</span>

				<span className="font-semibold">{value}%</span>
			</div>

			<div
				className="h-2 overflow-hidden rounded-full bg-muted"
				role="progressbar"
				aria-label={label}
				aria-valuenow={value}
				aria-valuemin={0}
				aria-valuemax={100}
			>
				<div
					className="h-full rounded-full bg-primary transition-[width] duration-1000 ease-out motion-reduce:transition-none"
					style={{
						width: `${mounted ? value : 0}%`,
					}}
				/>
			</div>
		</div>
	);
}
