import { createClient } from '@supportos/auth/server';

import { getCurrentMembership } from '@/lib/dashboard/dashboard';

// Phase 16B/16C -- workspace management.
//
// Audit finding: organizations and members already carry everything the
// handoff asks for (name, created_at, and a four-level role enum --
// owner/admin/agent/viewer -- already enforced by RLS via the existing
// user_has_role() function). Nothing here is new schema; this is a read
// layer over what already exists, for a settings page that was
// previously a static, non-functional mockup.

export type MemberRole = 'owner' | 'admin' | 'agent' | 'viewer';

/**
 * Display labels for the existing four-level role enum. The handoff asks
 * for a simple Owner/Admin/Member model -- rather than hiding the real
 * distinction between "agent" (can work findings/recommendations) and
 * "viewer" (read-only) behind one fabricated "Member" label, both are
 * shown honestly with a short description of what each can do. Owner and
 * Admin already map directly.
 */
export const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
	owner: 'Owner',
	admin: 'Admin',
	agent: 'Member',
	viewer: 'Viewer',
};

export const MEMBER_ROLE_DESCRIPTIONS: Record<MemberRole, string> = {
	owner: 'Full access, including organization settings.',
	admin: 'Can manage connections and operational data.',
	agent: 'Can view and work findings and recommendations.',
	viewer: 'Can view Sentinel, read-only.',
};

export interface WorkspaceMember {
	id: string;
	displayName: string | null;
	role: MemberRole;
	isCurrentMember: boolean;
}

export interface WorkspaceOverview {
	organizationId: string;
	organizationName: string;
	organizationCreatedAt: string;
	currentMemberRole: MemberRole;
	members: WorkspaceMember[];
}

/**
 * Reads the current organization plus its full member list. Two RLS-
 * scoped reads (organizations, members), not a new table, not a new
 * query pattern -- same shape as getCurrentMembership() and every other
 * read in src/lib/dashboard and src/lib/signals.
 */
export async function getWorkspaceOverview(): Promise<WorkspaceOverview | null> {
	const membership = await getCurrentMembership();
	if (!membership) {
		return null;
	}

	const supabase = await createClient();

	const [{ data: organization, error: orgError }, { data: memberRows, error: membersError }] =
		await Promise.all([
			supabase
				.from('organizations')
				.select('id, name, created_at')
				.eq('id', membership.organizationId)
				.maybeSingle(),
			supabase
				.from('members')
				.select('id, display_name, role')
				.eq('organization_id', membership.organizationId)
				.order('created_at', { ascending: true }),
		]);

	if (orgError || !organization) {
		console.error('[workspace] fetching organization:', orgError);
		return null;
	}

	if (membersError) {
		console.error('[workspace] fetching members:', membersError);
	}

	const members: WorkspaceMember[] = (memberRows ?? []).map(row => ({
		id: row.id,
		displayName: row.display_name,
		role: row.role,
		isCurrentMember: row.id === membership.memberId,
	}));

	const currentMemberRole = members.find(member => member.isCurrentMember)?.role ?? 'viewer';

	return {
		organizationId: organization.id,
		organizationName: organization.name,
		organizationCreatedAt: organization.created_at,
		currentMemberRole,
		members,
	};
}
