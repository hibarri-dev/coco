import { getStripe, json } from './_lib/stripe.js';

// Fulfilment is driven by this webhook, never by the success page: visitors can close the tab
// before returning, and anyone can open the success URL by hand.
export async function POST(request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return json({ error: 'not_configured' }, 503);

  const payload = await request.text();
  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, request.headers.get('stripe-signature'), secret);
  } catch (err) {
    console.warn('[stripe-webhook] signature check failed', err?.message);
    return json({ error: 'invalid_signature' }, 400);
  }

  const session = event.data.object;
  // The Stripe account is shared with other Hibarri projects, so their events arrive here too.
  if (session?.metadata?.app !== 'coco') return json({ received: true, ignored: true });

  // Bank debits (ACH, SEPA) complete the session as "unpaid" and settle days later via async_payment_succeeded.
  const paid =
    (event.type === 'checkout.session.completed' && session.payment_status === 'paid') || event.type === 'checkout.session.async_payment_succeeded';
  if (event.type === 'checkout.session.async_payment_failed') {
    console.warn('[stripe-webhook] async payment failed', session.client_reference_id);
    await forwardToLeads({ reference: session.client_reference_id, sessionId: session.id, ...session.metadata }, 'server-order-payment-failed');
  }

  if (paid) {
    const order = {
      reference: session.client_reference_id,
      sessionId: session.id,
      paymentIntent: session.payment_intent,
      amount: session.amount_total / 100,
      currency: session.currency,
      email: session.customer_details?.email ?? session.customer_email,
      ...session.metadata,
      paidAt: new Date(event.created * 1000).toISOString(),
    };
    console.info('[stripe-webhook] order paid', JSON.stringify(order));
    await forwardToLeads(order);
  }

  return json({ received: true });
}

async function forwardToLeads(order, form = 'server-order-paid') {
  const endpoint = process.env.LEADS_ENDPOINT || process.env.VITE_LEADS_ENDPOINT;
  if (!endpoint || endpoint.startsWith('/')) return;
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ form, data: order, submittedAt: new Date().toISOString() }),
    });
  } catch (err) {
    console.error('[stripe-webhook] could not forward order', err?.message);
  }
}
