import Link from 'next/link';

import { SidebarNav } from './sidebar-nav';

export function Sidebar() {
	return (
		<aside className="hidden w-72 border-r bg-card lg:flex lg:flex-col">
			<div className="flex h-16 items-center border-b px-6">
				<Link href="/dashboard" className="block">
					<h1 className="font-heading text-lg text-foreground">
						SupportOS
					</h1>

					<p className="text-xs text-muted-foreground">
						AI customer operations platform
					</p>
				</Link>
			</div>

			<SidebarNav />

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
