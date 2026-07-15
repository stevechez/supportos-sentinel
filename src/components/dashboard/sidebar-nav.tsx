'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@supportos/ui/utils';
import { navigationGroups } from '@/lib/navigation';

interface SidebarNavProps {
	onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
	const pathname = usePathname();

	return (
		<nav className="flex-1 space-y-6 p-4">
			{navigationGroups.map(group => (
				<div key={group.label ?? '__untitled'} className="space-y-1">
					{group.label && (
						<p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							{group.label}
						</p>
					)}

					{group.items.map(item => {
						const Icon = item.icon;
						const isActive =
							item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

						return (
							<Link
								key={item.name}
								href={item.href}
								onClick={onNavigate}
								className={cn(
									'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
									isActive
										? 'bg-brand/10 font-medium text-brand'
										: 'text-muted-foreground hover:bg-muted hover:text-foreground',
								)}
							>
								<Icon className="h-4 w-4" aria-hidden="true" />

								{item.name}
							</Link>
						);
					})}
				</div>
			))}
		</nav>
	);
}
