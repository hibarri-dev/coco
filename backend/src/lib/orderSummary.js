const money = (usd, currency = 'usd') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: (currency || 'usd').toUpperCase() }).format(Number(usd) || 0);

export function dataCenterLabel(dc = {}) {
  const site = [dc.provider, dc.facility].filter(Boolean).join(' ');
  const place = [dc.city, dc.region].filter(Boolean).join(', ');
  return [site, place].filter(Boolean).join(', ') || 'the data center';
}

/** Priced lines shared by the purchase email and the PDF invoice, so the two never disagree. */
export function orderLineItems(order) {
  const q = order.quote || {};
  const m = order.model || {};
  const currency = order.currency || 'usd';
  const lines = [
    {
      description: `${m.name || 'Server'}${m.cpu ? ` (${m.cpu}${m.ram ? `, ${m.ram}` : ''})` : ''}`,
      qty: q.qty || 1,
      unit: money(q.unitPrice, currency),
      amount: money(q.serversSubtotal, currency),
    },
  ];
  if (q.discount) lines.push({ description: 'Volume discount', qty: '', unit: '', amount: `-${money(q.discount, currency)}` });
  if (q.rackTotal) lines.push({ description: `Rack space (${q.rackU || 0}U, prepaid colocation)`, qty: '', unit: '', amount: money(q.rackTotal, currency) });
  return { lines, total: money(q.total, currency) };
}

export function orderFacts(order) {
  return [
    ['Order reference', order.reference],
    ['Data center', dataCenterLabel(order.dataCenter)],
    ['Payment method', order.paymentMethod === 'wire' ? 'Wire transfer' : 'Card'],
    ['Payment status', order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus],
  ];
}
