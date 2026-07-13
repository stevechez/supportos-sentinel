import { NextResponse } from 'next/server';
import type Stripe from 'stripe';

import { getStripe } from '@supportos/billing/stripe';
import { createAdminClient } from '@supportos/auth/admin';

// Stripe requires the raw request body to verify the webhook signature, so
// this route can't use the default JSON body parsing.
export async function POST(request: Request) {
	const signature = request.headers.get('stripe-signature');
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

	if (!signature || !webhookSecret) {
		return NextResponse.json(
			{ error: 'Missing Stripe signature or webhook secret.' },
			{ status: 400 },
		);
	}

	const body = await request.text();
	const stripe = getStripe();

	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Invalid payload';
		return NextResponse.json({ error: message }, { status: 400 });
	}

	const supabase = createAdminClient();

	switch (event.type) {
		case 'checkout.session.completed': {
			const session = event.data.object as Stripe.Checkout.Session;
			const organizationId =
				session.metadata?.organization_id ?? session.client_reference_id;

			if (organizationId && typeof session.customer === 'string') {
				await supabase
					.from('organizations')
					.update({
						stripe_customer_id: session.customer,
						stripe_subscription_id:
							typeof session.subscription === 'string'
								? session.subscription
								: null,
						subscription_status: 'active',
					})
					.eq('id', organizationId);
			}

			break;
		}

		case 'customer.subscription.updated':
		case 'customer.subscription.deleted': {
			const subscription = event.data.object as Stripe.Subscription;
			const customerId =
				typeof subscription.customer === 'string' ? subscription.customer : null;

			if (customerId) {
				await supabase
					.from('organizations')
					.update({ subscription_status: subscription.status })
					.eq('stripe_customer_id', customerId);
			}

			break;
		}

		default:
			break;
	}

	return NextResponse.json({ received: true });
}
