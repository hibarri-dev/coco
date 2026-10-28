import { Order } from '../models/Order.js';
import { isAdmin } from '../middlewares/auth.js';
import { REFERENCE } from '../lib/http.js';
import { buildInvoicePdf, invoiceFilename } from '../services/invoiceService.js';

export async function getUserOrders(req, res) {
  const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
  return res.json({ success: true, count: orders.length, orders: orders.map((o) => o.toPublic()) });
}

export async function getOrderByReference(req, res) {
  const { reference } = req.params;
  if (!REFERENCE.test(reference)) {
    return res.status(404).json({ error: 'not_found', message: 'Order not found' });
  }
  const filter = isAdmin(req.user) ? { reference } : { reference, userId: req.user._id };
  const order = await Order.findOne(filter);
  if (!order) {
    return res.status(404).json({ error: 'not_found', message: 'Order not found' });
  }
  return res.json({ success: true, order: order.toPublic() });
}

export async function getOrderInvoice(req, res) {
  const { reference } = req.params;
  if (!REFERENCE.test(reference)) {
    return res.status(404).json({ error: 'not_found', message: 'Order not found' });
  }
  const filter = isAdmin(req.user) ? { reference } : { reference, userId: req.user._id };
  const order = await Order.findOne(filter);
  if (!order || order.paymentStatus === 'cancelled') {
    return res.status(404).json({ error: 'not_found', message: 'Order not found' });
  }
  return sendInvoicePdf(res, order);
}

export async function sendInvoicePdf(res, order) {
  const pdf = await buildInvoicePdf(order);
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${invoiceFilename(order)}"`,
    'Cache-Control': 'private, no-store',
  });
  return res.send(pdf);
}
