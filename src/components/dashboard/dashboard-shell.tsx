import { Sidebar } from './sidebar';
import { DashboardHeader } from './header';

interface DashboardShellProps {
	children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
	return (
		<div className="min-h-screen bg-background">
			<div className="flex">
				<Sidebar />

				<div className="flex min-h-screen flex-1 flex-col">
					<DashboardHeader />

					<main className="flex-1 px-6 py-8 lg:px-8">{children}</main>
				</div>
			</div>
		</div>
	);
}
