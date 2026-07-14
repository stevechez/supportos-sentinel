// Phase 18D -- lightweight feedback capture, not a feedback SaaS. Four
// fixed categories, matching the handoff's own examples verbatim, so the
// type a customer picks maps directly to the sentence they'd say out loud.

export type FeedbackType = 'confusion' | 'missing_capability' | 'bug' | 'value';

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
	confusion: "I don't understand...",
	missing_capability: 'I wish it could...',
	bug: 'This does not work...',
	value: 'This saved me time...',
};

export type FeedbackPriority = 'low' | 'normal' | 'high';

export type FeedbackStatus = 'new' | 'reviewed' | 'resolved';

export interface FeedbackEntry {
	id: string;
	memberName: string | null;
	feedbackType: FeedbackType;
	message: string;
	context: string | null;
	priority: FeedbackPriority;
	status: FeedbackStatus;
	createdAt: string;
}
