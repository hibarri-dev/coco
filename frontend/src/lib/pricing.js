export const MARKUP = 0.1;
export const RACK_PER_U_MONTH = 115;
export const RACK_MONTHS = 24;
export const FULL_RACK_U = 42;
export const MIN_SERVERS = 5;
export const VCPU_HOUR_RATE = 0.012;
export const HOURS_PER_MONTH = 720;
export const COCO_FEE = 0.2;

export const PACKAGE_TYPES = [
  { id: 'five', label: '5 servers', hint: 'Minimum package' },
  { id: 'rack', label: 'Full rack', hint: '42U of rack space' },
  { id: 'custom', label: 'Custom', hint: '5 servers or more' },
];

export function volumeDiscount(quantity) {
  if (quantity >= 10) return 0.15;
  if (quantity >= 5) return 0.1;
  return 0;
}

export const serversPerRack = (u) => Math.max(1, Math.floor(FULL_RACK_U / u));

export function packageQuantity(model, packageType, quantity) {
  if (packageType === 'rack') return serversPerRack(model.u);
  if (packageType === 'custom') return Math.max(MIN_SERVERS, Math.round(quantity) || MIN_SERVERS);
  return MIN_SERVERS;
}

const cents = (n) => Math.round(n * 100) / 100;

export const selectionQuery = (s) => new URLSearchParams({ country: s.country, model: s.model, pkg: s.pkg, qty: String(s.qty) }).toString();

export function selectionFromQuery(params) {
  const pkg = PACKAGE_TYPES.some((p) => p.id === params.get('pkg')) ? params.get('pkg') : 'five';
  return {
    country: params.get('country') || 'US',
    model: params.get('model') || '',
    pkg,
    qty: Number(params.get('qty')) || MIN_SERVERS,
  };
}

export function quote(model, packageType, quantity) {
  const qty = packageQuantity(model, packageType, quantity);
  const unitPrice = cents(model.supplierPrice * (1 + MARKUP));
  const serversSubtotal = cents(unitPrice * qty);
  const discountRate = volumeDiscount(qty);
  const discount = cents(serversSubtotal * discountRate);
  const usedU = model.u * qty;
  const rackU = packageType === 'rack' ? FULL_RACK_U : usedU;
  const rackMonthly = rackU * RACK_PER_U_MONTH;
  const rackTotal = rackMonthly * RACK_MONTHS;
  const total = cents(serversSubtotal - discount + rackTotal);
  const grossMonthly = cents(model.vcpu * qty * VCPU_HOUR_RATE * HOURS_PER_MONTH);
  const fee = cents(grossMonthly * COCO_FEE);
  const netMonthly = cents(grossMonthly - fee);

  return {
    qty,
    unitPrice,
    serversSubtotal,
    discountRate,
    discount,
    usedU,
    rackU,
    rackMonthly,
    rackTotal,
    total,
    grossMonthly,
    fee,
    netMonthly,
    paybackMonths: netMonthly > 0 ? total / netMonthly : null,
  };
}
