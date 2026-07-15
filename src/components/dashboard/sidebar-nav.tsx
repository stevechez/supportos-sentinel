'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@supportos/ui/utils';
import { navigation } from '@/lib/navigation';

interface SidebarNavProps {
	onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
	const pathname = usePathname();

	return (
		<nav className="flex-1 space-y-1 p-4">
			{navigation.map(item => {
				const Icon = item.icon;
				const isActive = pathname.startsWith(item.href);

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
		</nav>
	);
}
