import {
	LayoutDashboard,
	FileText,
	AlertTriangle,
	ClipboardList,
	BookOpen,
	MessageCircle,
	Inbox,
	Settings,
} from 'lucide-react';

// Phase 21B: restructured from a flat seven-item list into grouped
// sections that match how a customer actually thinks about this product --
// "my conversations", "my support operations", "what Sentinel found" --
// instead of a flat list of Sentinel output types. Every href below already
// existed or is backed by real data (see docs/architecture/unified-customer-
// operations.md); this is a presentation change, not a new system.
//
// "AI Assistants" (formerly /dashboard/intelligence, a static page with
// hardcoded "Active" labels and no real data behind it -- see the Phase 21A
// audit) has been removed from navigation. The route itself still exists,
// rewritten to be honest about what's real, but it's no longer a primary
// nav item since it described capabilities rather than doing anything a
// user could act on.
export interface NavigationItem {
	name: string;
	href: string;
	icon: typeof LayoutDashboard;
}

export interface NavigationGroup {
	/** Null renders with no section label -- used for the single trailing Settings item. */
	label: string | null;
	items: NavigationItem[];
}

export const navigationGroups: NavigationGroup[] = [
	{
		label: 'Customer Operations',
		items: [
			{ name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
			{ name: 'Conversations', href: '/dashboard/conversations', icon: MessageCircle },
			{ name: 'Support Inbox', href: '/dashboard/support', icon: Inbox },
		],
	},
	{
		label: 'Intelligence',
		items: [
			{ name: 'Findings', href: '/findings', icon: AlertTriangle },
			{ name: 'Recommendations', href: '/recommendations', icon: ClipboardList },
			{ name: 'Reports', href: '/reports', icon: FileText },
			{ name: 'Knowledge Gaps', href: '/dashboard/knowledge-gaps', icon: BookOpen },
		],
	},
	{
		label: null,
		items: [{ name: 'Settings', href: '/dashboard/settings', icon: Settings }],
	},
];

/** Flat form, kept for anything that just needs "is this href in the nav" without caring about grouping. */
export const navigation: NavigationItem[] = navigationGroups.flatMap(group => group.items);
