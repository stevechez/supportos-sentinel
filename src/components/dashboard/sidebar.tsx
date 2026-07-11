import Link from 'next/link';
import { navigation } from '@/lib/navigation';

export function Sidebar() {
	return (
		<aside className="hidden w-72 border-r bg-card lg:flex lg:flex-col">
			<div className="flex h-16 items-center border-b px-6">
				<div>
					<h1 className="text-lg font-semibold tracking-tight">
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

					return (
						<Link
							key={item.name}
							href={item.href}
							className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
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
