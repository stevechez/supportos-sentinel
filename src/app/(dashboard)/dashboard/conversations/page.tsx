import { redirect } from 'next/navigation';

// Phase 21/v2: this page's content moved to /dashboard/inbox, which
// combines the conversation list with the open/escalation summary
// (formerly split across this page and /dashboard/support) into the
// single Inbox the nav now points to. Kept as a redirect rather than
// deleted so any existing link or bookmark still lands somewhere real.
export default function ConversationsPageRedirect() {
	redirect('/dashboard/inbox');
}
