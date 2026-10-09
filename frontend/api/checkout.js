import { getStripe, json } from './_lib/stripe.js';
import { getCatalog, getLocation, locationLabel } from '../src/data/catalog.js';
import { quote, selectionQuery, PACKAGE_TYPES, RACK_MONTHS } from '../src/lib/pricing.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REFERENCE = /^CC-[A-Z0-9]{4,12}$/;
const RETURN_PATHS = ['/checkout', '/live/checkout'];
// Stripe's per-payment ceiling for USD card payments.
const MAX_AMOUNT_CENTS = 99_999_999;

const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]+$/;

const clip = (value, max = 200) => String(value ?? '').trim().slice(0, max);
const toCents = (usd) => Math.round(usd * 100);

// The success page calls this so "Payment received" is only shown once Stripe confirms it.
export async function GET(request) {
  const stripe = getStripe();
  if (!stripe) return json({ error: 'not_configured' }, 503);
  const id = new URL(request.url).searchParams.get('session_id') ?? '';
  if (!SESSION_ID.test(id)) return json({ error: 'invalid_session' }, 400);
  try {
    const session = await stripe.checkout.sessions.retrieve(id);
    if (session.metadata?.app !== 'coco') return json({ error: 'not_found' }, 404);
    return json({
      status: session.payment_status === 'paid' || session.payment_status === 'no_payment_required' ? 'paid' : session.status === 'complete' ? 'processing' : 'unpaid',
      reference: session.client_reference_id,
      email: session.customer_details?.email ?? session.customer_email ?? null,
      amount: session.amount_total / 100,
    });
  } catch (err) {
    console.error('[checkout] session lookup failed', err?.type, err?.message);
    return json({ error: 'not_found' }, 404);
  }
}

export async function POST(request) {
  const stripe = getStripe();
  if (!stripe) return json({ error: 'not_configured' }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const { reference, selection = {}, customer = {}, address = {} } = body ?? {};
  const email = clip(customer.email).toLowerCase();
  if (!REFERENCE.test(reference ?? '')) return json({ error: 'invalid_reference' }, 400);
  if (!EMAIL.test(email)) return json({ error: 'invalid_email' }, 400);
  if (!PACKAGE_TYPES.some((p) => p.id === selection.pkg)) return json({ error: 'invalid_package' }, 400);

  // Prices are always recomputed here; the total sent by the browser is never trusted.
  const location = getLocation(selection.location);
  const catalog = await getCatalog(location.id);
  const model = catalog.find((m) => m.id === selection.model);
  if (!model) return json({ error: 'model_unavailable' }, 400);
  const q = quote(model, selection.pkg, Number(selection.qty));

  const serversCents = toCents(q.serversSubtotal - q.discount);
  const rackCents = toCents(q.rackTotal);
  if (serversCents + rackCents > MAX_AMOUNT_CENTS) return json({ error: 'amount_too_large' }, 400);

  const origin = process.env.SITE_URL || new URL(request.url).origin;
  const returnPath = RETURN_PATHS.includes(body.returnPath) ? body.returnPath : '/checkout';
  const query = selectionQuery({ location: location.id, model: model.id, pkg: selection.pkg, qty: q.qty });
  const back = (status) => `${origin}${returnPath}?${query}&payment=${status}&ref=${reference}`;

  const metadata = {
    app: 'coco',
    reference,
    location: location.id,
    country: location.country,
    dataCenter: locationLabel(location),
    model: model.id,
    package: selection.pkg,
    quantity: String(q.qty),
    rackU: String(q.rackU),
    name: clip(customer.name),
    phone: clip(customer.phone, 40),
    company: clip(customer.company),
    address: clip([address.line1, address.line2, address.city, address.region, address.postal, address.country].filter(Boolean).join(', '), 500),
  };

  try {
    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        customer_email: email,
        client_reference_id: reference,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'usd',
              unit_amount: serversCents,
              product_data: {
                name: `${q.qty} × ${model.name}`,
                description: q.discountRate ? `Includes ${Math.round(q.discountRate * 100)}% volume discount` : undefined,
              },
            },
          },
          {
            quantity: 1,
            price_data: {
              currency: 'usd',
              unit_amount: rackCents,
              product_data: {
                name: `Rack space, ${RACK_MONTHS} months`,
                description: `${q.rackU}U at ${locationLabel(location)}`,
              },
            },
          },
        ],
        metadata,
        payment_intent_data: { metadata },
        success_url: `${back('success')}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: back('cancelled'),
      },
      { idempotencyKey: `checkout-${reference}` },
    );
    return json({ url: session.url });
  } catch (err) {
    console.error('[checkout] stripe error', err?.type, err?.message);
    return json({ error: 'stripe_error' }, 502);
  }
}
