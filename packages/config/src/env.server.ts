// Server-only environment variables. Never import this from a Client
// Component — it's meant for Server Actions, Route Handlers, webhooks,
// and other trusted server contexts only.
//
// Preserves the exact behavior of the code this replaces: secrets that
// previously threw a specific error message on first use still throw the
// same message, lazily, only when actually accessed. Vars that were
// previously read as plain optional strings (and handled with a guard
// clause by the caller, not a throw) stay plain optional strings here.

function required(name: string, value: string | undefined): string {
	if (!value) {
		throw new Error(`${name} is not set.`);
	}

	return value;
}

export const serverEnv = {
	get supabaseServiceRoleKey(): string {
		return required(
			'SUPABASE_SERVICE_ROLE_KEY',
			process.env.SUPABASE_SERVICE_ROLE_KEY,
		);
	},
	get stripeSecretKey(): string {
		return required('STRIPE_SECRET_KEY', process.env.STRIPE_SECRET_KEY);
	},
	stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
	stripePriceId: process.env.STRIPE_PRICE_ID,
	// Optional by design: the AI Executive Brief feature (src/lib/ai) is meant
	// to degrade gracefully when this isn't set, not throw. See
	// src/lib/ai/analyst.ts.
	anthropicApiKey: process.env.ANTHROPIC_API_KEY,
	// Model selection abstraction (Phase 6 cost control): one place to change
	// models. Defaults to Haiku -- this is a short, structured summarization
	// task over a handful of already-computed numbers, not open-ended
	// reasoning, so the cheapest/fastest current model is the right default.
	anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001',
	// Phase 19C -- the founder dashboard (a cross-organization pilot view)
	// is gated by this allowlist rather than any role in the member_role
	// hierarchy, because member_role is org-scoped by design (Phase 16C)
	// and this page deliberately needs to see across organizations. Empty
	// by default, so the page is unreachable until explicitly configured --
	// no one gets cross-tenant visibility by accident. Comma-separated
	// emails, case-insensitive.
	founderEmails: (process.env.FOUNDER_EMAILS ?? '')
		.split(',')
		.map(email => email.trim().toLowerCase())
		.filter(Boolean),
};
