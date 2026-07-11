import {
	LayoutDashboard,
	FileText,
	AlertTriangle,
	BookOpen,
	Users,
	Settings,
} from 'lucide-react';

export const navigation = [
	{
		name: 'Overview',
		href: '/',
		icon: LayoutDashboard,
	},
	{
		name: 'Reports',
		href: '/reports',
		icon: FileText,
	},
	{
		name: 'Findings',
		href: '/findings',
		icon: AlertTriangle,
	},
	{
		name: 'Knowledge Gaps',
		href: '/knowledge-gaps',
		icon: BookOpen,
	},
	{
		name: 'Agent Intelligence',
		href: '/agents',
		icon: Users,
	},
	{
		name: 'Settings',
		href: '/settings',
		icon: Settings,
	},
];
