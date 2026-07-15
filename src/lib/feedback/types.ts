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

// Phase 20D -- founder-side triage categories, set after reading feedback
// (never collected from the customer). Nullable: most feedback starts
// undecided.
export type FeedbackDecision = 'build' | 'fix' | 'document' | 'ignore' | 'investigate';

export const FEEDBACK_DECISION_LABELS: Record<FeedbackDecision, string> = {
	build: 'Build',
	fix: 'Fix',
	document: 'Document',
	ignore: 'Ignore',
	investigate: 'Investigate',
};

export interface FeedbackEntry {
	id: string;
	memberName: string | null;
	feedbackType: FeedbackType;
	message: string;
	context: string | null;
	priority: FeedbackPriority;
	status: FeedbackStatus;
	decision: FeedbackDecision | null;
	decisionNotes: string | null;
	createdAt: string;
}
