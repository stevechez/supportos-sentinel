import { Bell, Search } from 'lucide-react';

import { MobileSidebar } from './mobile-sidebar';

interface DashboardHeaderProps {
	title?: string;
	description?: string;
}

export function DashboardHeader({
	title = 'AI Operations Command Center',
	description = 'Sentinel monitoring active systems',
}: DashboardHeaderProps) {
	return (
		<header className="flex h-16 items-center justify-between border-b bg-background px-6 lg:px-8">
			<div className="flex items-center gap-3">
				<MobileSidebar />

				<div>
					<p className="text-sm font-medium">{title}</p>

					<p className="text-xs text-muted-foreground">{description}</p>
				</div>
			</div>

			<div className="flex items-center gap-3">
				<button
					type="button"
					aria-label="Search"
					className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
				>
					<Search className="h-4 w-4" aria-hidden="true" />
				</button>

				<button
					type="button"
					aria-label="Notifications"
					className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
				>
					<Bell className="h-4 w-4" aria-hidden="true" />
				</button>

				<div
					aria-hidden="true"
					className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium"
				>
					S
				</div>
			</div>
		</header>
	);
}
