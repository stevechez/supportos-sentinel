// One-off setup script: creates the "Sentinel" Product + a $149/month
// recurring Price in your Stripe account (test mode, using the key in
// .env.local), then prints the price ID to paste into STRIPE_PRICE_ID.
//
// Usage:
//   node --env-file=.env.local scripts/create-stripe-price.mjs
//
// Safe to re-run — it looks for an existing active "Sentinel" product/price
// before creating a new one.

import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
	console.error(
		'STRIPE_SECRET_KEY is not set. Run this with --env-file=.env.local, e.g.\n' +
			'  node --env-file=.env.local scripts/create-stripe-price.mjs',
	);
	process.exit(1);
}

const stripe = new Stripe(secretKey, { apiVersion: '2026-06-24.dahlia' });

async function main() {
	const existingProducts = await stripe.products.search({
		query: "name:'Sentinel' AND active:'true'",
	});

	let product = existingProducts.data[0];

	if (product) {
		console.log(`Found existing product: ${product.id}`);
	} else {
		product = await stripe.products.create({
			name: 'Sentinel',
			description: 'Sentinel AI business assistant — one connected plan.',
		});
		console.log(`Created product: ${product.id}`);
	}

	const existingPrices = await stripe.prices.list({
		product: product.id,
		active: true,
	});

	let price = existingPrices.data.find(
		p => p.unit_amount === 14900 && p.recurring?.interval === 'month',
	);

	if (price) {
		console.log(`Found existing $149/month price: ${price.id}`);
	} else {
		price = await stripe.prices.create({
			product: product.id,
			unit_amount: 14900,
			currency: 'usd',
			recurring: { interval: 'month' },
			nickname: 'Sentinel Monthly',
		});
		console.log(`Created price: ${price.id}`);
	}

	console.log('\nAdd this to .env.local:\n');
	console.log(`STRIPE_PRICE_ID=${price.id}`);
}

main().catch(err => {
	console.error('Failed to set up Stripe price:', err.message);
	process.exit(1);
});
