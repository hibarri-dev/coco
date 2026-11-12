import { EmailLog } from '../models/EmailLog.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { Server } from '../models/Server.js';
import { getMailer, FROM } from './mailer.js';
import { resolveTemplate, renderTemplate } from './emailTemplates.js';
import { buildInvoicePdf, invoiceFilename } from './invoiceService.js';
import { dataCenterLabel } from '../lib/orderSummary.js';
import { primaryClientUrl } from '../config/env.js';

const displayName = (name = '') => String(name).trim() || 'there';

function serverVars(server) {
  return {
    ServerName: server?.name || '',
    Serial: server?.serial || '',
    RackNumber: server?.rackNumber || '',
    DataCenter: dataCenterLabel(server?.dataCenterDetails || {}) || server?.datacenter || '',
  };
}

/** Placeholder values for a lifecycle email, built from the order and/or server it is about. */
export function buildVars({ user, order, server }) {
  return {
    Name: displayName(order?.customer?.name || user?.name),
    DashboardUrl: `${primaryClientUrl()}${user?.role === 'user' ? '/dev' : '/dashboard'}`,
    ...(server ? serverVars(server) : {}),
    ...(order ? { DataCenter: dataCenterLabel(order.dataCenter), OrderReference: order.reference } : {}),
  };
}

async function claim(key, refId, to, trigger) {
  try {
    await EmailLog.create({ key, refId, to, trigger, status: 'sending' });
    return true;
  } catch (err) {
    if (err?.code === 11000) {
      // A failed earlier attempt may be retried; anything sent, in flight or skipped is left alone.
      const retry = await EmailLog.findOneAndUpdate(
        { key, refId, status: 'failed' },
        { $set: { status: 'sending', to, trigger, error: '' } }
      );
      return Boolean(retry);
    }
    throw err;
  }
}

const finish = (key, refId, $set) => EmailLog.updateOne({ key, refId }, { $set });

/**
 * Sends one lifecycle email at most once per (key, refId). Never throws: a mail failure must not
 * break checkout, fulfilment or an admin action. Returns the resulting log status.
 */
export async function sendLifecycleEmail(key, { user, order, server, trigger = '' } = {}) {
  const refId = String(server?.serial || order?.reference || user?._id || '');
  try {
    if (!refId) return 'skipped';
    const owner = user ?? (await User.findById(server?.userId || order?.userId).lean());
    const to = order?.customer?.email || owner?.email;
    if (!to) return 'skipped';

    if (!(await claim(key, refId, to, trigger))) return 'duplicate';

    const template = await resolveTemplate(key);
    if (!template.enabled) {
      await finish(key, refId, { status: 'skipped', error: 'template disabled' });
      return 'skipped';
    }

    const mailer = getMailer();
    if (!mailer) {
      console.info(`[Email] SMTP not configured; would send ${key} to ${to} (${refId})`);
      await finish(key, refId, { status: 'skipped', error: 'smtp not configured' });
      return 'skipped';
    }

    const vars = buildVars({ user: owner, order, server });
    const { subject, html, text } = renderTemplate(template, vars, { order });
    const attachments = template.attachesInvoice && order
      ? [{ filename: invoiceFilename(order), content: await buildInvoicePdf(order), contentType: 'application/pdf' }]
      : undefined;

    await mailer.sendMail({ from: FROM(), to, replyTo: process.env.EMAIL_REPLY_TO || undefined, subject, html, text, attachments });
    await finish(key, refId, { status: 'sent', sentAt: new Date(), error: '' });
    return 'sent';
  } catch (err) {
    console.error(`[Email] ${key} for ${refId} failed:`, err?.message);
    await finish(key, refId, { status: 'failed', error: String(err?.message || err).slice(0, 500) }).catch(() => {});
    return 'failed';
  }
}

export const notifySignup = (user) => sendLifecycleEmail('account_welcome', { user, trigger: 'signup' });

export async function notifyPurchase(orderId) {
  try {
    const order = await Order.findById(orderId).lean();
    if (!order || order.paymentStatus !== 'paid') return 'skipped';
    return await sendLifecycleEmail('purchase_completed', { order, trigger: order.metadata?.paidVia || 'fulfilment' });
  } catch (err) {
    console.error(`[Email] purchase_completed for order ${orderId} failed:`, err?.message);
    return 'failed';
  }
}

/** Sends first_use for every server that just got its first customer. Claims firstUseAt atomically. */
export async function notifyFirstUse(serverIds) {
  try {
    const candidates = await Server.find({ _id: { $in: serverIds }, customers: { $gt: 0 }, firstUseAt: null }).lean();
    for (const server of candidates) {
      const claimed = await Server.findOneAndUpdate(
        { _id: server._id, firstUseAt: null },
        { $set: { firstUseAt: new Date() } },
        { returnDocument: 'after' }
      ).lean();
      if (claimed) await sendLifecycleEmail('first_use', { server: claimed, trigger: 'placement' });
    }
  } catch (err) {
    console.error('[Email] first_use check failed:', err?.message);
  }
}
