import { Building2, ShieldCheck, Sparkles, Users } from 'lucide-react';

import { Container } from '@/components/marketing/container';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { ConnectedSourcesCard } from '@/components/dashboard/connected-sources-card';
import { EmptyState } from '@/components/dashboard/empty-state';

import { createClient } from '@supportos/auth/server';
import { getRecentActivity } from '@/lib/activity';
import { getConnectedSourcesOverview } from '@/lib/signals/data';
import { getWorkspaceOverview, MEMBER_ROLE_DESCRIPTIONS, MEMBER_ROLE_LABELS } from '@/lib/workspace';

// Phase 16B/16C/16D/16A: a real, functional Settings page. Previously a
// static mockup of section labels with no data behind any of them
// ("Business name", "Team members" as plain bullet text) -- every
// section below now reads real rows, organization/members via
// src/lib/workspace.ts, connected sources via the existing Phase 9/10
// data layer, activity via src/lib/activity.ts. No new intelligence, no
// new AI -- this is workspace management, not a Sentinel feature.
export default async function SettingsPage() {
	const workspace = await getWorkspaceOverview();

	if (!workspace) {
		return (
			<section className="py-10">
				<Container>
					<EmptyState
						icon={Building2}
						title="No organization found"
						description="Your account isn't linked to an organization yet, so there's nothing to manage here. Ask your workspace admin to add you, or contact support if this seems wrong."
					/>
				</Container>
			</section>
		);
	}

	const supabase = await createClient();
	const [connectedSources, activity] = await Promise.all([
		getConnectedSourcesOverview(),
		getRecentActivity(supabase, workspace.organizationId),
	]);

	return (
		<section className="py-10">
			<Container>
				<div className="max-w-3xl">
					<p className="text-sm font-medium uppercase tracking-wide text-brand">Settings</p>

					<h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
						Manage your workspace
					</h1>

					<p className="mt-4 text-muted-foreground">
						Your organization, your team, and what Sentinel does with your data.
					</p>
				</div>

				<div className="mt-10 space-y-10">
					{/* Organization */}
					<div className="rounded-2xl border border-border bg-card p-6">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
								<Building2 className="h-5 w-5 text-brand" />
							</div>
							<div>
								<h2 className="font-medium text-foreground">{workspace.organizationName}</h2>
								<p className="mt-0.5 text-sm text-muted-foreground">
									Created{' '}
									{new Date(workspace.organizationCreatedAt).toLocaleDateString(undefined, {
										year: 'numeric',
										month: 'long',
										day: 'numeric',
									})}
								</p>
							</div>
						</div>
					</div>

					{/* Connected Sources -- reuses the existing Phase 9/10 card, not a second copy of it. */}
					<div>
						<h2 className="mb-4 text-lg font-medium text-foreground">Connected sources</h2>
						<ConnectedSourcesCard sources={connectedSources ?? []} />
					</div>

					{/* Members / roles (Phase 16C) */}
					<div>
						<div className="mb-4 flex items-center gap-2">
							<Users className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
							<h2 className="text-lg font-medium text-foreground">Team</h2>
						</div>

						<div className="divide-y rounded-2xl border border-border bg-card">
							{workspace.members.map(member => (
								<div key={member.id} className="flex items-center justify-between gap-4 p-5">
									<div>
										<p className="font-medium text-foreground">
											{member.displayName ?? 'Unnamed member'}
											{member.isCurrentMember && (
												<span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span>
											)}
										</p>
										<p className="mt-0.5 text-xs text-muted-foreground">
											{MEMBER_ROLE_DESCRIPTIONS[member.role]}
										</p>
									</div>
									<span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
										{MEMBER_ROLE_LABELS[member.role]}
									</span>
								</div>
							))}
						</div>
					</div>

					{/* AI usage transparency (Phase 16D) */}
					<div>
						<div className="mb-4 flex items-center gap-2">
							<ShieldCheck className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
							<h2 className="text-lg font-medium text-foreground">AI usage &amp; trust</h2>
						</div>

						<div className="space-y-3 rounded-2xl border border-border bg-card p-6 text-sm leading-6 text-muted-foreground">
							<p>
								<span className="font-medium text-foreground">
									Sentinel uses AI to explain insights it has already found.
								</span>{' '}
								Every finding, score, priority, and trend is calculated using the same fixed
								rules every time -- never guessed by AI. AI is only ever asked to explain a
								conclusion Sentinel already reached, in plain language.
							</p>
							<p>
								<span className="font-medium text-foreground">AI does not make operational decisions.</span>{' '}
								It never creates a finding, sets a priority, or predicts an outcome on its own.
							</p>
							<p>
								<span className="font-medium text-foreground">Your data is only used to provide your organization&apos;s own insights.</span>{' '}
								It is not used to train shared AI models or shown to other organizations.
							</p>
						</div>
					</div>

					{/* Recent activity (Phase 16A) */}
					<div>
						<div className="mb-4 flex items-center gap-2">
							<Sparkles className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
							<h2 className="text-lg font-medium text-foreground">Recent activity</h2>
						</div>
						<ActivityFeed entries={activity} />
					</div>
				</div>
			</Container>
		</section>
	);
}
