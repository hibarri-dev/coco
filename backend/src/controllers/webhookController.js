import { getStripe } from '../config/stripe.js';
import { fulfillOrder } from '../services/provisionService.js';
import { Order } from '../models/Order.js';
import { DEV_BILLING_EVENTS, handleDevBillingEvent } from '../services/devBillingService.js';
import { CREDIT_EVENTS, handleCreditEvent } from '../services/creditService.js';
import { forwardLead } from '../lib/leads.js';

const HANDLED = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
  'checkout.session.expired',
]);

// Paid orders are also forwarded to Hibarri Superadmin > Coco > Forms, as the old Vercel function did.
const forwardToLeads = (data, form) => forwardLead(form, data);

export async function handleStripeWebhook(req, res) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    console.error('[StripeWebhook] Stripe or webhook secret not configured');
    return res.status(503).json({ error: 'not_configured' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], secret);
  } catch (err) {
    console.warn('[StripeWebhook] Signature check failed:', err.message);
    return res.status(400).json({ error: 'invalid_signature' });
  }

  if (CREDIT_EVENTS.has(event.type)) {
    try {
      if (await handleCreditEvent(event)) return res.json({ received: true });
    } catch (err) {
      console.error(`[StripeWebhook] Failed to process credit top-up ${event.type}:`, err);
      return res.status(500).json({ error: 'processing_failed' });
    }
  }

  if (DEV_BILLING_EVENTS.has(event.type)) {
    try {
      if (await handleDevBillingEvent(event)) return res.json({ received: true });
    } catch (err) {
      console.error(`[StripeWebhook] Failed to process developer plan event ${event.type}:`, err);
      return res.status(500).json({ error: 'processing_failed' });
    }
  }

  const session = event.data.object;
  // The Stripe account is shared with other Hibarri projects, so their events arrive here too.
  if (!HANDLED.has(event.type) || session?.metadata?.app !== 'coco') {
    return res.json({ received: true, ignored: true });
  }

  const reference = session.client_reference_id || session.metadata?.reference;
  const isPaid =
    (event.type === 'checkout.session.completed' && session.payment_status === 'paid') ||
    event.type === 'checkout.session.async_payment_succeeded';

  try {
    if (isPaid) {
      const result = await fulfillOrder(reference, {
        sessionId: session.id,
        paymentIntentId: session.payment_intent,
        amountTotal: session.amount_total,
        currency: session.currency,
        source: 'stripe_webhook',
      });
      await forwardToLeads(
        {
          reference,
          sessionId: session.id,
          paymentIntent: session.payment_intent,
          amount: session.amount_total / 100,
          currency: session.currency,
          email: session.customer_details?.email ?? session.customer_email,
          status: result?.order?.paymentStatus ?? 'unknown',
          ...session.metadata,
          paidAt: new Date(event.created * 1000).toISOString(),
        },
        'server-order-paid'
      );
    } else if (event.type === 'checkout.session.completed') {
      await Order.updateOne({ reference, paymentStatus: 'awaiting' }, { $set: { paymentStatus: 'processing' } });
    } else if (event.type === 'checkout.session.async_payment_failed') {
      await Order.updateOne({ reference, paymentStatus: { $ne: 'paid' } }, { $set: { paymentStatus: 'failed' } });
      await forwardToLeads({ reference, sessionId: session.id, ...session.metadata }, 'server-order-payment-failed');
    } else if (event.type === 'checkout.session.expired') {
      await Order.updateOne({ reference, paymentStatus: 'awaiting' }, { $set: { paymentStatus: 'cancelled' } });
    }
  } catch (err) {
    console.error(`[StripeWebhook] Failed to process ${event.type} for ${reference}:`, err);
    // A non-2xx makes Stripe retry with backoff, so a paid order is never silently dropped.
    return res.status(500).json({ error: 'processing_failed' });
  }

  return res.json({ received: true });
}
