import { FeedbackWidget } from './feedback-widget';
import { Sidebar } from './sidebar';

interface DashboardShellProps {
	children: React.ReactNode;
}

// Provides the sidebar + page frame for every (dashboard) route. Each page
// renders its own <DashboardHeader title=... description=... /> as the
// first child (full-bleed, no padding) followed by its padded body content,
// instead of the shell rendering a second, generic header.
//
// Phase 18E -- FeedbackWidget is mounted once here (not per-page) so the
// "send feedback" entry point is present everywhere in the product,
// consistently, without every page needing to remember to render it.
export function DashboardShell({ children }: DashboardShellProps) {
	return (
		<div className="min-h-screen bg-background">
			<div className="flex">
				<Sidebar />

				<div className="flex min-h-screen flex-1 flex-col">
					<main id="main-content" className="flex flex-1 flex-col">
						{children}
					</main>
				</div>
			</div>

			<FeedbackWidget />
		</div>
	);
}
