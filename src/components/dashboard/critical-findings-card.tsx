'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, MessagesSquare, ShieldCheck, Star } from 'lucide-react';

import { EmptyState } from './empty-state';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from '@supportos/ui/components/sheet';
import { Button } from '@supportos/ui/components/button';

import { RelatedHistory } from './related-history';

import { updateFindingStatusAction } from '@/lib/dashboard/actions';
import { FINDING_STATUS_LABELS, FINDING_STATUS_ORDER } from '@/lib/dashboard/improvement';
import type { Finding, ImprovementEvent, Recommendation } from '@/lib/dashboard/dashboard';
import type { FindingProvenance } from '@/lib/signals/provenance';

interface CriticalFindingsCardProps {
	findings: Finding[];
	recommendations: Recommendation[];
	improvementEvents: ImprovementEvent[];
	/** Phase 21E: which real conversations produced each finding, keyed by finding id. Optional so this card still works anywhere it's rendered without provenance loaded. */
	provenance?: Map<string, FindingProvenance>;
}

const INLINE_LIMIT = 3;

export function CriticalFindingsCard({ findings, recommendations, improvementEvents, provenance }: CriticalFindingsCardProps) {
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
					title="Excellent."
					description="No critical operational risks detected. You'll see findings here as soon as Sentinel spots something."
				/>
			) : (
				<>
					<div className="divide-y">
						{visible.map(finding => (
							<FindingRow
								key={finding.id}
								finding={finding}
								recommendations={recommendations}
								improvementEvents={improvementEvents}
								source={provenance?.get(finding.id)}
							/>
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
							<FindingRow
								key={finding.id}
								finding={finding}
								recommendations={recommendations}
								improvementEvents={improvementEvents}
								source={provenance?.get(finding.id)}
								detailed
							/>
						))}
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}

function FindingRow({
	finding,
	recommendations,
	improvementEvents,
	source,
	detailed = false,
}: {
	finding: Finding;
	recommendations: Recommendation[];
	improvementEvents: ImprovementEvent[];
	source?: FindingProvenance;
	detailed?: boolean;
}) {
	const linkedRecommendation = recommendations.find(r => r.findingId === finding.id);

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

					{detailed && (
						<div className="mt-4 space-y-3 border-t pt-4">
							<DetailRow label="Status">
								<StatusControl findingId={finding.id} status={finding.status} />
							</DetailRow>

							{finding.businessImpact && (
								<DetailRow label="Business impact">{finding.businessImpact}</DetailRow>
							)}

							{linkedRecommendation && (
								<>
									<DetailRow label="Recommendation">{linkedRecommendation.title}</DetailRow>
									<DetailRow label="Expected impact">{linkedRecommendation.impact}</DetailRow>
								</>
							)}

							{source && source.tickets.length > 0 && (
								<DetailRow label="Where this came from">
									<div className="space-y-1">
										<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
											<MessagesSquare className="h-3.5 w-3.5" aria-hidden="true" />
											Found across {source.signalCount} observation{source.signalCount === 1 ? '' : 's'} in these conversations:
										</p>
										<ul className="space-y-0.5">
											{source.tickets.map(ticket => (
												<li key={ticket.id}>&ldquo;{ticket.subject}&rdquo;</li>
											))}
										</ul>
									</div>
								</DetailRow>
							)}

							<RelatedHistory candidateTitle={finding.title} events={improvementEvents} />
						</div>
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

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
			<span className="w-36 shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
				{label}
			</span>
			<span className="text-sm text-foreground">{children}</span>
		</div>
	);
}

/**
 * Advances a finding one step through the lifecycle (Open -> Acknowledged
 * -> In Progress -> Resolved). Deliberately a single "next step" button
 * rather than a free-form status picker -- the lifecycle is a simple
 * forward chain per Phase 7's scope, not a general workflow tool.
 */
function StatusControl({ findingId, status }: { findingId: string; status: string }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	const currentIndex = FINDING_STATUS_ORDER.indexOf(status as (typeof FINDING_STATUS_ORDER)[number]);
	const nextStatus = currentIndex >= 0 ? FINDING_STATUS_ORDER[currentIndex + 1] : undefined;
	const isResolved = status === 'resolved';

	function handleAdvance() {
		if (!nextStatus) {
			return;
		}
		setError(null);
		startTransition(async () => {
			const result = await updateFindingStatusAction(findingId, nextStatus);
			if (result.ok) {
				router.refresh();
			} else {
				setError(result.error);
			}
		});
	}

	return (
		<div className="flex flex-wrap items-center gap-3">
			<span
				className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
					isResolved ? 'bg-emerald-400/10 text-emerald-400' : 'bg-muted text-muted-foreground'
				}`}
			>
				{isResolved && <CheckCircle2 className="h-3 w-3" aria-hidden="true" />}
				{FINDING_STATUS_LABELS[status as keyof typeof FINDING_STATUS_LABELS] ?? status}
			</span>

			{nextStatus && (
				<Button size="xs" variant="outline" onClick={handleAdvance} disabled={isPending}>
					{isPending ? 'Updating…' : `Mark ${FINDING_STATUS_LABELS[nextStatus]}`}
				</Button>
			)}

			{error && <span className="text-xs text-destructive">{error}</span>}
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
