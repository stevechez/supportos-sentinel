import { redirect } from 'next/navigation';

import { DashboardHeader } from '@/components/dashboard/header';
import { isFounder } from '@/lib/founder/auth';
import { getFounderPilotOverview } from '@/lib/founder/data';

export const metadata = {
	title: 'Pilot overview | Sentinel',
};

// Phase 19C -- a lightweight, founder-only view for managing pilots across
// organizations. Not a customer-facing admin panel: no customer can reach
// this page (isFounder() redirects anyone not on the FOUNDER_EMAILS
// allowlist straight back to their own dashboard, same as if the route
// didn't exist), and there is no edit, delete, or impersonation path here
// at all -- just the six read-only facts the Phase 19 handoff asked for,
// one row per organization.
export default async function FounderDashboardPage() {
	if (!(await isFounder())) {
		redirect('/dashboard');
	}

	const rows = await getFounderPilotOverview();

	return (
		<>
			<DashboardHeader title="Pilot overview" description="Every organization, at a glance. Founder-only." />

			<div className="px-6 py-8 lg:px-8">
				{rows.length === 0 ? (
					<p className="text-sm text-muted-foreground">No organizations yet.</p>
				) : (
					<div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
						<table className="w-full text-left text-sm">
							<thead>
								<tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
									<th className="px-4 py-3 font-medium">Organization</th>
									<th className="px-4 py-3 font-medium">Signed up</th>
									<th className="px-4 py-3 font-medium">Members</th>
									<th className="px-4 py-3 font-medium">Connected source</th>
									<th className="px-4 py-3 font-medium">Baseline created</th>
									<th className="px-4 py-3 font-medium">Last activity</th>
									<th className="px-4 py-3 font-medium">Feedback</th>
								</tr>
							</thead>
							<tbody className="divide-y">
								{rows.map(row => (
									<tr key={row.organizationId}>
										<td className="px-4 py-3 font-medium text-foreground">{row.organizationName}</td>
										<td className="px-4 py-3 text-muted-foreground">{formatDate(row.signupDate)}</td>
										<td className="px-4 py-3 text-muted-foreground">{row.memberCount}</td>
										<td className="px-4 py-3">
											<StatusBadge ok={row.connectedSource} yes="Connected" no="Not connected" />
										</td>
										<td className="px-4 py-3">
											<StatusBadge ok={row.baselineCreated} yes="Yes" no="Not yet" />
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{row.lastActivityAt ? formatDate(row.lastActivityAt) : 'No activity yet'}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{row.feedbackCount === 0
												? '--'
												: `${row.feedbackCount} total${row.openFeedbackCount > 0 ? ` (${row.openFeedbackCount} open)` : ''}`}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</>
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
