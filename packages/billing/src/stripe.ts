import Stripe from 'stripe';

import { serverEnv } from '@supportos/config/env/server';

let stripeClient: Stripe | null = null;

/**
 * Lazily-instantiated server-side Stripe client. Never import this from a
 * Client Component — it uses the secret key.
 */
export function getStripe(): Stripe {
	if (!stripeClient) {
		stripeClient = new Stripe(serverEnv.stripeSecretKey, {
			apiVersion: '2026-06-24.dahlia',
		});
	}

	return stripeClient;
}
