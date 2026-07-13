import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

/**
 * Lazily-instantiated server-side Stripe client. Never import this from a
 * Client Component — it uses the secret key.
 */
export function getStripe(): Stripe {
	if (!stripeClient) {
		const secretKey = process.env.STRIPE_SECRET_KEY;

		if (!secretKey) {
			throw new Error('STRIPE_SECRET_KEY is not set.');
		}

		stripeClient = new Stripe(secretKey, {
			apiVersion: '2026-06-24.dahlia',
		});
	}

	return stripeClient;
}
