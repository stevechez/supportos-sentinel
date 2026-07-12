import {
	LayoutDashboard,
	FileText,
	AlertTriangle,
	ClipboardList,
	BookOpen,
	Users,
	Settings,
} from 'lucide-react';

export const navigation = [
	{
		name: 'Overview',
		href: '/dashboard',
		icon: LayoutDashboard,
	},
	{
		name: 'Findings',
		href: '/findings',
		icon: AlertTriangle,
	},
	{
		name: 'Recommendations',
		href: '/recommendations',
		icon: ClipboardList,
	},
	{
		name: 'Reports',
		href: '/reports',
		icon: FileText,
	},
	{
		name: 'Knowledge Gaps',
		href: '/dashboard/knowledge-gaps',
		icon: BookOpen,
	},
	{
		name: 'Intelligence',
		href: '/dashboard/intelligence',
		icon: Users,
	},
	{
		name: 'Settings',
		href: '/dashboard/settings',
		icon: Settings,
	},
];
