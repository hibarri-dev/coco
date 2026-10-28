import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { Server } from '../models/Server.js';
import { notifyPurchase } from './notificationService.js';

export function parseRamGb(ram = '') {
  const match = String(ram).match(/([\d.]+)\s*(TB|GB)/i);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  return Math.round(match[2].toUpperCase() === 'TB' ? value * 1024 : value);
}

const serialFor = (reference, i) => `${reference}-${String(i).padStart(2, '0')}`;

function serverDocument(order, index) {
  const dc = order.dataCenter || {};
  const model = order.model || {};
  const qty = order.quote.qty;
  const vcpu = model.vcpu || 0;
  const cores = Math.round(vcpu / 2);
  const serversNet = (order.quote.serversSubtotal || 0) - (order.quote.discount || 0);
  const now = new Date();

  return {
    userId: order.userId,
    orderId: order._id,
    orderReference: order.reference,
    serial: serialFor(order.reference, index),
    name: model.name || 'Server',
    location: dc.city || '',
    datacenter: `${dc.provider || 'Data center'} · ${dc.facility || ''}`.trim(),
    dataCenterDetails: dc,
    cpu: `${cores}C`,
    cores,
    vcpu,
    cpuModel: model.cpu || '',
    ram: (model.ram || '').replace(/\s*DDR\d/i, '').replace(/\s+/g, ''),
    ramGb: parseRamGb(model.ram),
    storage: model.storage || '',
    network: model.network || '',
    rackU: model.u || 1,
    status: 'Ordered',
    purchasePrice: Math.round((serversNet / qty) * 100) / 100,
    purchasedOn: now,
    alerts: [
      {
        level: 'info',
        title: 'Ordered from Dell Technologies',
        detail: `Ships free to ${dc.provider || 'the data center'} (${dc.facility || ''}) in ${dc.city || ''}, ${dc.region || ''}. Tracking and go-live will be updated here.`,
        time: now,
      },
    ],
    history: [{ m: now.toLocaleDateString('en-US', { month: 'short' }), v: 0 }],
  };
}

async function ensureServer(doc) {
  try {
    await Server.updateOne({ serial: doc.serial }, { $setOnInsert: doc }, { upsert: true });
  } catch (err) {
    // Two concurrent upserts for the same serial: the other one won, which is fine.
    if (err?.code !== 11000) throw err;
  }
}

/**
 * Marks an order paid and creates one Server per unit, tagged with the selected data center.
 * Safe to call repeatedly and concurrently (webhook + success page + admin).
 * Pass amountTotal (in cents) for card payments so a mismatched charge is held for review.
 */
export async function fulfillOrder(reference, payment = {}) {
  const order = await Order.findOne({ reference });
  if (!order) {
    console.warn(`[Provision] Order ${reference} not found`);
    return null;
  }

  if (order.provisionedAt) {
    return { order, servers: await Server.find({ orderId: order._id }) };
  }

  if (payment.amountTotal != null) {
    // Orders created before amountCents existed fall back to their quoted total.
    const expectedCents = order.amountCents ?? Math.round((order.quote?.total || 0) * 100);
    const currencyOk = !payment.currency || payment.currency.toLowerCase() === (order.currency || 'usd');
    if (!currencyOk || payment.amountTotal !== expectedCents) {
      console.error(
        `[Provision] Amount mismatch on ${reference}: charged ${payment.amountTotal} ${payment.currency}, expected ${expectedCents} ${order.currency || 'usd'}`
      );
      const review = {
        paymentStatus: 'review',
        'metadata.reviewReason': 'amount_mismatch',
        'metadata.chargedCents': payment.amountTotal,
        'metadata.chargedCurrency': payment.currency,
      };
      if (payment.sessionId) review.stripeSessionId = payment.sessionId;
      if (payment.paymentIntentId) review.stripePaymentIntentId = payment.paymentIntentId;
      // updateOne, not save(): older orders may be missing fields the schema now requires.
      await Order.updateOne({ _id: order._id, paymentStatus: { $ne: 'paid' } }, { $set: review });
      return { order: await Order.findById(order._id), servers: [], review: true };
    }
  }

  if (!order.userId) {
    console.error(`[Provision] Order ${reference} has no owner; cannot provision servers`);
    return { order, servers: [] };
  }

  const paidUpdate = { paymentStatus: 'paid', paidAt: new Date() };
  if (payment.sessionId) paidUpdate.stripeSessionId = payment.sessionId;
  if (payment.paymentIntentId) paidUpdate.stripePaymentIntentId = payment.paymentIntentId;
  if (payment.source) paidUpdate['metadata.paidVia'] = payment.source;
  await Order.updateOne({ _id: order._id, paymentStatus: { $ne: 'paid' } }, { $set: paidUpdate });

  for (let i = 1; i <= order.quote.qty; i++) {
    await ensureServer(serverDocument(order, i));
  }

  await Order.updateOne({ _id: order._id, provisionedAt: null }, { $set: { provisionedAt: new Date() } });
  // Anyone who owns hardware is a cloud partner.
  await User.updateOne({ _id: order.userId, role: 'user' }, { $set: { role: 'investor' } });

  const fresh = await Order.findById(order._id);
  const servers = await Server.find({ orderId: order._id });
  console.info(`[Provision] ${reference}: ${servers.length} server(s) ready in ${order.dataCenter?.city} (${order.dataCenter?.facility})`);
  void notifyPurchase(order._id);
  return { order: fresh, servers };
}
