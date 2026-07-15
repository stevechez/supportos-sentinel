import { redirect } from 'next/navigation';

import { DashboardHeader } from '@/components/dashboard/header';
import { FeedbackDecisionSelect } from '@/components/founder/feedback-decision-select';
import { PilotContactEditor } from '@/components/founder/pilot-contact-editor';
import { PilotStatusSelect } from '@/components/founder/pilot-status-select';
import { FEEDBACK_TYPE_LABELS } from '@/lib/feedback/types';
import { isFounder } from '@/lib/founder/auth';
import { getFounderFeedback, getFounderPilotOverview, summarizeFounderPilots } from '@/lib/founder/data';

export const metadata = {
	title: 'Pilot overview | Sentinel',
};

// Phase 19C built this as a read-only view; Phase 20B/C/D/I extend it with
// the pilot-tracking fields, activation summary, and feedback triage the
// Phase 20 handoff asks for -- still one page, still founder-only, still
// no way for a customer to reach it (isFounder() redirects anyone not on
// the FOUNDER_EMAILS allowlist straight back to their own dashboard).
export default async function FounderDashboardPage() {
	if (!(await isFounder())) {
		redirect('/dashboard');
	}

	const [rows, feedback] = await Promise.all([getFounderPilotOverview(), getFounderFeedback()]);
	const summary = summarizeFounderPilots(rows);

	return (
		<>
			<DashboardHeader title="Pilot overview" description="Every organization, at a glance. Founder-only." />

			<div className="space-y-8 px-6 py-8 lg:px-8">
				{/* Phase 20C/20I -- the summary a founder actually opens this page
					to see: is anything activating, and how long is it taking. */}
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<SummaryCard label="Active pilots" value={String(summary.activePilots)} />
					<SummaryCard
						label="Activation rate"
						value={`${Math.round(summary.activationRate * 100)}%`}
						hint={`${summary.activatedCount} of ${summary.totalOrganizations}`}
					/>
					<SummaryCard
						label="Avg. time to value"
						value={summary.averageTimeToValueDays === null ? '--' : `${summary.averageTimeToValueDays.toFixed(1)}d`}
						hint="Signup to first insight"
					/>
					<SummaryCard
						label="Feedback"
						value={String(summary.totalFeedback)}
						hint={summary.openFeedback > 0 ? `${summary.openFeedback} open` : 'None open'}
					/>
				</div>

				{summary.dropOffAtConnect > 0 || summary.dropOffAtSync > 0 ? (
					<p className="text-xs text-muted-foreground">
						Drop-off: {summary.dropOffAtConnect} never connected a source, {summary.dropOffAtSync} connected but
						never reached a first insight.
					</p>
				) : null}

				{rows.length === 0 ? (
					<p className="text-sm text-muted-foreground">No organizations yet.</p>
				) : (
					<div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
						<table className="w-full text-left text-sm">
							<thead>
								<tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
									<th className="px-4 py-3 font-medium">Organization</th>
									<th className="px-4 py-3 font-medium">Pilot status</th>
									<th className="px-4 py-3 font-medium">Primary contact</th>
									<th className="px-4 py-3 font-medium">Signed up</th>
									<th className="px-4 py-3 font-medium">Connected source</th>
									<th className="px-4 py-3 font-medium">First insight</th>
									<th className="px-4 py-3 font-medium">Insights</th>
									<th className="px-4 py-3 font-medium">Last activity</th>
									<th className="px-4 py-3 font-medium">Feedback</th>
									<th className="px-4 py-3 font-medium">Health</th>
								</tr>
							</thead>
							<tbody className="divide-y">
								{rows.map(row => (
									<tr key={row.organizationId}>
										<td className="px-4 py-3 font-medium text-foreground">{row.organizationName}</td>
										<td className="px-4 py-3">
											<PilotStatusSelect organizationId={row.organizationId} status={row.pilotStatus} />
										</td>
										<td className="px-4 py-3 text-xs">
											<PilotContactEditor
												organizationId={row.organizationId}
												name={row.primaryContactName}
												email={row.primaryContactEmail}
											/>
										</td>
										<td className="px-4 py-3 text-muted-foreground">{formatDate(row.signupDate)}</td>
										<td className="px-4 py-3">
											<StatusBadge ok={row.connectedSource} yes="Connected" no="Not connected" />
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{row.firstInsightAt ? formatDate(row.firstInsightAt) : 'Not yet'}
										</td>
										<td className="px-4 py-3 text-muted-foreground">{row.insightsGenerated}</td>
										<td className="px-4 py-3 text-muted-foreground">
											{row.lastActivityAt ? formatDate(row.lastActivityAt) : 'No activity yet'}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{row.feedbackCount === 0
												? '--'
												: `${row.feedbackCount} total${row.openFeedbackCount > 0 ? ` (${row.openFeedbackCount} open)` : ''}`}
										</td>
										<td className="px-4 py-3">
											<HealthBadge score={row.latestHealthScore} />
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				{/* Phase 20D -- feedback triage across every organization. */}
				<div>
					<h2 className="mb-3 text-sm font-semibold text-foreground">Feedback triage</h2>

					{feedback.length === 0 ? (
						<p className="text-sm text-muted-foreground">No feedback submitted yet.</p>
					) : (
						<div className="space-y-3">
							{feedback.map(item => (
								<div key={item.id} className="rounded-lg border bg-card p-4">
									<div className="flex flex-wrap items-center justify-between gap-3">
										<div className="flex items-center gap-2 text-xs text-muted-foreground">
											<span className="font-medium text-foreground">{item.organizationName}</span>
											<span>·</span>
											<span>{FEEDBACK_TYPE_LABELS[item.feedbackType]}</span>
											<span>·</span>
											<span>{formatDate(item.createdAt)}</span>
										</div>
										<FeedbackDecisionSelect feedbackId={item.id} decision={item.decision} />
									</div>
									<p className="mt-2 text-sm text-foreground">{item.message}</p>
									{item.context && <p className="mt-1 text-xs text-muted-foreground">From: {item.context}</p>}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</>
	);
}

function SummaryCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
	return (
		<div className="rounded-xl border bg-card p-5 shadow-sm">
			<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
			<p className="mt-2 font-heading text-2xl text-foreground">{value}</p>
			{hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
		</div>
	);
}

// Phase 22C -- "customer health" at a glance. Same score/threshold the
// customer sees on their own Insights page (health-score-card.tsx uses the
// same rough bands); this just makes it scannable across many
// organizations at once, which a single customer's own dashboard has no
// reason to do.
function HealthBadge({ score }: { score: number | null }) {
	if (score === null) {
		return <span className="text-xs text-muted-foreground">--</span>;
	}

	const style =
		score >= 70
			? 'bg-emerald-400/10 text-emerald-400'
			: score >= 40
				? 'bg-amber-400/10 text-amber-400'
				: 'bg-destructive/10 text-destructive';

	return (
		<span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
			{Math.round(score)}
		</span>
	);
}

function StatusBadge({ ok, yes, no }: { ok: boolean; yes: string; no: string }) {
	return (
		<span
			className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
				ok ? 'bg-emerald-400/10 text-emerald-400' : 'bg-muted text-muted-foreground'
			}`}
		>
			{ok ? yes : no}
		</span>
	);
}

function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
