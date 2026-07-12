'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { navigation } from '@/lib/navigation';

export function Sidebar() {
	const pathname = usePathname();

	return (
		<aside className="hidden w-72 border-r bg-card lg:flex lg:flex-col">
			<div className="flex h-16 items-center border-b px-6">
				<div>
					<h1 className="font-heading text-lg text-foreground">
						SupportOS Sentinel
					</h1>

					<p className="text-xs text-muted-foreground">
						Customer Intelligence Platform
					</p>
				</div>
			</div>

			<nav className="flex-1 space-y-1 p-4">
				{navigation.map(item => {
					const Icon = item.icon;
					const isActive =
						item.href === '/'
							? pathname === '/'
							: pathname.startsWith(item.href);

					return (
						<Link
							key={item.name}
							href={item.href}
							className={cn(
								'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
								isActive
									? 'bg-brand/10 font-medium text-brand'
									: 'text-muted-foreground hover:bg-muted hover:text-foreground',
							)}
						>
							<Icon className="h-4 w-4" />

							{item.name}
						</Link>
					);
				})}
			</nav>

			<div className="border-t p-4">
				<div className="rounded-lg bg-muted p-3">
					<p className="text-xs font-medium">Sentinel Status</p>

					<p className="mt-1 text-xs text-muted-foreground">
						All systems operational
					</p>
				</div>
			</div>
		</aside>
	);
}
