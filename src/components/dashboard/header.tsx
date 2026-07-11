import { Bell, Search } from 'lucide-react';

export function DashboardHeader() {
	return (
		<header className="flex h-16 items-center justify-between border-b bg-background px-6 lg:px-8">
			<div>
				<p className="text-sm font-medium">AI Operations Command Center</p>

				<p className="text-xs text-muted-foreground">
					Sentinel monitoring active systems
				</p>
			</div>

			<div className="flex items-center gap-3">
				<button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
					<Search className="h-4 w-4" />
				</button>

				<button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
					<Bell className="h-4 w-4" />
				</button>

				<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
					S
				</div>
			</div>
		</header>
	);
}
