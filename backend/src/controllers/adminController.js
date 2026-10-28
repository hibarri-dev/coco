import { Order, PAYMENT_STATUSES } from '../models/Order.js';
import { Server, SERVER_STATUSES } from '../models/Server.js';
import { User, ROLES } from '../models/User.js';
import { fulfillOrder } from '../services/provisionService.js';
import { serverView } from '../lib/serverView.js';
import { str, EMAIL, REFERENCE } from '../lib/http.js';
import { sendLifecycleEmail, notifyFirstUse } from '../services/notificationService.js';
import { sendInvoicePdf } from './orderController.js';

const LIMIT = 200;
// The "Configuration" and "Live" stages admins pick in Hibarri, and the email each one sends.
const CONFIGURATION_STATUS = 'Provisioning';
const STAGE_EMAILS = { [CONFIGURATION_STATUS]: 'server_configuration', Online: 'server_live' };
const PERCENT_FIELDS = ['cpuUtil', 'ramUtil', 'storageUtil', 'networkUtil', 'gpuUtil', 'uptime'];
const COUNT_FIELDS = ['customers', 'allocatedVcpu', 'allocatedRamGb'];
const MONEY_FIELDS = ['revenue', 'revenueToDate'];
const DC_COST_FIELDS = ['colocation', 'power', 'crossConnect', 'remoteHands'];
const ALERT_LEVELS = ['info', 'warning', 'critical'];

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const currentMonth = () => new Date().toLocaleDateString('en-US', { month: 'short' });

function adminOrderView(order) {
  const owner = order.userId && typeof order.userId === 'object' && order.userId.email ? order.userId : null;
  return {
    ...order.toPublic(),
    id: order._id,
    amountCents: order.amountCents,
    stripeSessionId: order.stripeSessionId,
    stripePaymentIntentId: order.stripePaymentIntentId,
    metadata: order.metadata,
    owner: owner ? { id: owner._id, name: owner.name, email: owner.email, role: owner.role } : null,
  };
}

async function findOrder(reference) {
  return REFERENCE.test(reference) ? Order.findOne({ reference }) : null;
}

export async function listOrders(req, res) {
  const filter = {};
  const status = str(req.query.status, 20);
  const method = str(req.query.method, 10);
  if (PAYMENT_STATUSES.includes(status)) filter.paymentStatus = status;
  if (['card', 'wire'].includes(method)) filter.paymentMethod = method;

  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(LIMIT).populate('userId', 'name email role');
  return res.json({ success: true, count: orders.length, orders: orders.map(adminOrderView) });
}

// Confirms a wire transfer (or clears a card order held for review) and provisions its servers.
export async function markOrderPaid(req, res) {
  const order = await findOrder(req.params.reference);
  if (!order) return res.status(404).json({ error: 'not_found', message: 'Order not found' });
  if (order.paymentStatus === 'cancelled') {
    return res.status(409).json({ error: 'order_cancelled', message: 'Cancelled orders cannot be marked paid' });
  }
  if (!order.userId) {
    return res.status(409).json({
      error: 'no_owner',
      message: 'This order is not linked to an account. Link it with POST /api/admin/orders/:reference/assign first.',
    });
  }

  await Order.updateOne(
    { _id: order._id },
    { $set: { 'metadata.markedPaidBy': req.user.email, 'metadata.markedPaidAt': new Date(), 'metadata.adminNote': str(req.body?.note, 500) } }
  );
  const result = await fulfillOrder(order.reference, { source: `admin:${req.user.email}` });
  return res.json({ success: true, order: adminOrderView(result.order), servers: result.servers.map(serverView) });
}

export async function getOrderInvoiceAdmin(req, res) {
  const order = await findOrder(req.params.reference);
  if (!order) return res.status(404).json({ error: 'not_found', message: 'Order not found' });
  return sendInvoicePdf(res, order);
}

export async function cancelOrder(req, res) {
  const order = await findOrder(req.params.reference);
  if (!order) return res.status(404).json({ error: 'not_found', message: 'Order not found' });
  if (order.paymentStatus === 'paid') {
    return res.status(409).json({ error: 'order_paid', message: 'Paid orders must be refunded in Stripe, not cancelled' });
  }
  // updateOne, not save(): older orders may be missing fields the schema now requires.
  await Order.updateOne(
    { _id: order._id, paymentStatus: { $ne: 'paid' } },
    { $set: { paymentStatus: 'cancelled', 'metadata.cancelledBy': req.user.email, 'metadata.cancelReason': str(req.body?.reason, 500) } }
  );
  return res.json({ success: true, order: adminOrderView(await findOrder(order.reference)) });
}

// Links an order placed before accounts existed to the buyer's account, after the admin has confirmed it is theirs.
export async function assignOrder(req, res) {
  const order = await findOrder(req.params.reference);
  if (!order) return res.status(404).json({ error: 'not_found', message: 'Order not found' });
  const email = str(req.body?.email, 254).toLowerCase();
  if (!EMAIL.test(email)) return res.status(400).json({ error: 'invalid_email', message: 'Send the email of the account to link' });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'user_not_found', message: 'No account with that email. Ask the buyer to register first.' });
  if (order.userId && String(order.userId) !== String(user._id)) {
    return res.status(409).json({ error: 'already_owned', message: 'This order already belongs to another account' });
  }

  await Order.updateOne(
    { _id: order._id },
    { $set: { userId: user._id, 'metadata.assignedBy': req.user.email, 'metadata.assignedAt': new Date() } }
  );
  await Server.updateMany({ orderReference: order.reference }, { $set: { userId: user._id } });
  return res.json({ success: true, order: adminOrderView(await findOrder(order.reference)) });
}

export async function listServers(req, res) {
  const filter = {};
  const status = str(req.query.status, 20);
  if (SERVER_STATUSES.includes(status)) filter.status = status;
  const servers = await Server.find(filter).sort({ createdAt: -1 }).limit(LIMIT).populate('userId', 'name email');
  return res.json({
    success: true,
    count: servers.length,
    servers: servers.map((s) => ({
      ...serverView(s),
      stageHistory: s.stageHistory || [],
      owner: s.userId?.email ? { id: s.userId._id, name: s.userId.name, email: s.userId.email } : null,
    })),
  });
}

export async function updateServer(req, res) {
  const server = await Server.findOne({ serial: str(req.params.serial, 40) });
  if (!server) return res.status(404).json({ error: 'not_found', message: 'Server not found' });

  const body = req.body ?? {};
  const errors = [];
  let enteredStage = null;
  const hadCustomers = server.customers > 0;

  if (body.rackNumber !== undefined) {
    const rack = str(body.rackNumber, 40);
    if (typeof body.rackNumber !== 'string') errors.push('rackNumber must be a string');
    else server.rackNumber = rack;
  }

  if (body.status !== undefined) {
    if (!SERVER_STATUSES.includes(body.status)) {
      errors.push(`status must be one of ${SERVER_STATUSES.join(', ')}`);
    } else if (body.status === CONFIGURATION_STATUS && !server.rackNumber) {
      errors.push('rackNumber is required to move a server to the Configuration stage');
    } else if (body.status !== server.status) {
      server.status = body.status;
      enteredStage = body.status;
      if (body.status === 'Online' && !server.onlineSince) server.onlineSince = new Date();
      server.stageHistory.push({ status: body.status, at: new Date(), by: req.user.email || '' });
      const detail = body.status === CONFIGURATION_STATUS
        ? `Your server has arrived and is being configured in rack ${server.rackNumber}.`
        : `Your server is now ${body.status.toLowerCase()}.`;
      server.alerts.push({ level: 'info', title: `Status: ${body.status}`, detail: str(body.statusNote, 500) || detail, time: new Date() });
    }
  }

  for (const field of PERCENT_FIELDS) {
    if (body[field] === undefined) continue;
    if (field === 'gpuUtil' && body[field] === null) server[field] = null;
    else if (isNum(body[field]) && body[field] >= 0 && body[field] <= 100) server[field] = body[field];
    else errors.push(`${field} must be a number from 0 to 100`);
  }
  for (const field of [...COUNT_FIELDS, ...MONEY_FIELDS]) {
    if (body[field] === undefined) continue;
    if (isNum(body[field]) && body[field] >= 0) server[field] = body[field];
    else errors.push(`${field} must be a non-negative number`);
  }

  if (body.dcCosts !== undefined) {
    for (const field of DC_COST_FIELDS) {
      const v = body.dcCosts?.[field];
      if (v === undefined) continue;
      if (isNum(v) && v >= 0) server.dcCosts[field] = v;
      else errors.push(`dcCosts.${field} must be a non-negative number`);
    }
  }

  if (body.load !== undefined) {
    if (Array.isArray(body.load) && body.load.length <= 48 && body.load.every((v) => isNum(v) && v >= 0 && v <= 100)) server.load = body.load;
    else errors.push('load must be an array of up to 48 numbers from 0 to 100');
  }

  if (body.alert !== undefined) {
    const title = str(body.alert?.title, 200);
    if (!title || !ALERT_LEVELS.includes(body.alert?.level ?? 'info')) errors.push('alert needs a title and a level of info, warning or critical');
    else server.alerts.push({ level: body.alert.level ?? 'info', title, detail: str(body.alert.detail, 1000), time: new Date() });
  }

  if (errors.length) return res.status(400).json({ error: 'invalid_fields', message: errors.join('; ') });

  if (body.revenue !== undefined) {
    const month = currentMonth();
    const entry = server.history.find((h) => h.m === month);
    if (entry) entry.v = server.revenue;
    else server.history.push({ m: month, v: server.revenue });
    if (server.history.length > 12) server.history.splice(0, server.history.length - 12);
  }

  await server.save();

  let email = null;
  const emailKey = STAGE_EMAILS[enteredStage];
  if (emailKey && body.notify !== false) {
    email = { key: emailKey, status: await sendLifecycleEmail(emailKey, { server: server.toObject(), trigger: `admin:${req.user.email}` }) };
  }
  if (!hadCustomers && server.customers > 0 && server.status === 'Online') await notifyFirstUse([server._id]);

  return res.json({ success: true, server: serverView(server), email });
}

export async function listUsers(req, res) {
  const filter = {};
  const role = str(req.query.role, 20);
  if (ROLES.includes(role)) filter.role = role;
  const users = await User.find(filter).sort({ createdAt: -1 }).limit(LIMIT);
  return res.json({ success: true, count: users.length, users: users.map((u) => ({ ...u.toPublic(), status: u.status })) });
}
