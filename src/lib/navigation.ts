import { Inbox, Users, Bot, ListChecks, Settings } from 'lucide-react';

// Phase 21/v2 (superseding the earlier Phase 21B grouped nav from this
// same session): the handoff for this phase specifies an exact flat
// five-item navigation -- Inbox / Customers / AI Assistant / Insights /
// Settings -- matching how a customer thinks about one platform rather
// than a list of Sentinel output types. "Overview" (the landing page,
// Phase 21F's Customer Operations Home) isn't a nav item by design here --
// it's reached via the sidebar's logo/brand link, the same pattern most
// products use for "home", so the five items below stay exactly what the
// handoff asks for. Findings/Recommendations/Reports/Knowledge Gaps still
// exist as real routes, linked from within Insights rather than listed at
// the top level.
export interface NavigationItem {
	name: string;
	href: string;
	icon: typeof Inbox;
}

export const navigation: NavigationItem[] = [
	{ name: 'Inbox', href: '/dashboard/inbox', icon: Inbox },
	{ name: 'Customers', href: '/dashboard/customers', icon: Users },
	{ name: 'AI Assistant', href: '/dashboard/assistant', icon: Bot },
	{ name: 'Insights', href: '/dashboard/insights', icon: ListChecks },
	{ name: 'Settings', href: '/dashboard/settings', icon: Settings },
];
