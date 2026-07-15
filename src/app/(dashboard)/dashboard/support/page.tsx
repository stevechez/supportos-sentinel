import { redirect } from 'next/navigation';

// Phase 21/v2: this page's content (open tickets, escalations, recurring
// issues) merged into /dashboard/inbox's summary row. Kept as a redirect
// rather than deleted so any existing link or bookmark still lands
// somewhere real. Recurring issues specifically now live in Insights.
export default function SupportInboxPageRedirect() {
	redirect('/dashboard/inbox');
}
