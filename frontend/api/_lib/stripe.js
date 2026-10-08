import Stripe from 'stripe';

let client;

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY || '';
  if (!key) return null;
  client ??= new Stripe(key);
  return client;
}

export function json(body, status = 200) {
  return Response.json(body, { status });
}
