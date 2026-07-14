'use client';

import { useState } from 'react';
import { AlertTriangle, ArrowRight, Clock3, ShieldCheck, Star } from 'lucide-react';

import { EmptyState } from './empty-state';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from '@supportos/ui/components/sheet';
import { Button } from '@supportos/ui/components/button';

import type { Finding } from '@/lib/dashboard/dashboard';

interface CriticalFindingsCardProps {
	findings: Finding[];
}

const INLINE_LIMIT = 3;

export function CriticalFindingsCard({ findings }: CriticalFindingsCardProps) {
	const [open, setOpen] = useState(false);
	const visible = findings.slice(0, INLINE_LIMIT);
	const remaining = findings.length - visible.length;

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
				<>
					<div className="divide-y">
						{visible.map(finding => (
							<FindingRow key={finding.id} finding={finding} />
						))}
					</div>

					{remaining > 0 && (
						<div className="border-t p-3 text-center">
							<Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
								View all {findings.length} findings
							</Button>
						</div>
					)}
				</>
			)}

			<Sheet open={open} onOpenChange={setOpen}>
				<SheetContent className="flex flex-col gap-0 overflow-y-auto bg-card p-0">
					<SheetHeader className="border-b px-6 py-5">
						<SheetTitle className="font-heading text-lg">
							All Findings ({findings.length})
						</SheetTitle>

						<p className="text-xs text-muted-foreground">
							Ranked by severity, age, and recurrence
						</p>
					</SheetHeader>

					<div className="divide-y">
						{findings.map(finding => (
							<FindingRow key={finding.id} finding={finding} detailed />
						))}
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}

function FindingRow({ finding, detailed = false }: { finding: Finding; detailed?: boolean }) {
	return (
		<div className="p-5 transition-colors hover:bg-muted/40">
			<div className="mb-3 flex items-start justify-between gap-4">
				<div>
					<div className="flex items-center gap-2">
						{finding.isTopPriority && <TopPriorityBadge />}
						<h3 className="font-medium leading-6">{finding.title}</h3>
					</div>

					<div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
						<Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
						{finding.detected}
					</div>

					<div className="mt-2 flex flex-wrap gap-1.5">
						{finding.reasons.map(reason => (
							<span
								key={reason}
								className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
							>
								{reason}
							</span>
						))}
					</div>

					{detailed && finding.businessImpact && (
						<p className="mt-3 text-sm text-muted-foreground">
							<span className="font-medium text-foreground">Business impact: </span>
							{finding.businessImpact}
						</p>
					)}
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

				{!detailed && (
					<button
						type="button"
						className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
					>
						View Details
						<span className="sr-only">for {finding.title}</span>
						<ArrowRight className="h-4 w-4" aria-hidden="true" />
					</button>
				)}
			</div>
		</div>
	);
}

function TopPriorityBadge() {
	return (
		<span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
			<Star className="h-3 w-3" aria-hidden="true" />
			Top Priority
		</span>
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
