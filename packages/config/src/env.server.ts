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
};
