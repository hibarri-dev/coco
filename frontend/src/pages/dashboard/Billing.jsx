import { motion } from 'framer-motion';
import { CircleCheck, Building, CreditCard, FileText, Sparkles, CalendarClock, Download } from 'lucide-react';
import { Card, CardHeader, PageHeader, Stat, Table, EmptyState, InfoTip, page } from '../../components/dashboard/ui';
import { MobileList } from '../../components/dashboard/tables';
import { useAccountData } from '../../context/AccountDataContext';
import { orderLabel, fmtDate } from '../../lib/orders';
import { usd } from '../../data/packages';

const RACK_PREPAID_MONTHS = 24;

const SERVICES = [
  'Customer acquisition & marketing',
  'Metering & usage-based invoicing',
  'Payment collection & retries',
  'Workload scheduling across servers',
  'Data-center relations & remote hands',
];

function prepaidUntil(order) {
  const from = order?.paidAt || order?.createdAt;
  if (!from) return null;
  const d = new Date(from);
  d.setMonth(d.getMonth() + RACK_PREPAID_MONTHS);
  return d.toISOString();
}

export default function Billing() {
  const { servers, orders } = useAccountData();
  const paid = orders.filter((o) => o.paymentStatus === 'paid');
  const byRef = new Map(orders.map((o) => [o.reference, o]));
  const rows = servers.map((s) => ({ server: s, until: prepaidUntil(byRef.get(s.order)) }));
  const nextExpiry = rows.map((r) => r.until).filter(Boolean).sort()[0];

  return (
    <motion.div {...page}>
      <PageHeader title="Billing" hint="What you've paid for your servers and how long your rack space is covered." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Stat label="Hardware & rack space paid" value={usd(paid.reduce((a, o) => a + o.quote.total, 0))} hint={`Across ${paid.length} paid ${paid.length === 1 ? 'order' : 'orders'}.`} icon={FileText} accent />
        <Stat label="Rack space prepaid until" value={nextExpiry ? fmtDate(nextExpiry) : '—'} hint={nextExpiry ? 'The earliest expiry across your servers.' : 'Coverage starts when an order is paid.'} icon={CalendarClock} />
        <Card className="p-5">
          <div className="flex items-center gap-2 text-[15px] font-semibold"><Sparkles size={16} className="text-coco-lilac" /> Handled by CoCo</div>
          <div className="mt-3 space-y-2">
            {SERVICES.map((s) => (
              <div key={s} className="flex items-center gap-2.5 text-[12.5px] text-white/70">
                <CircleCheck size={14} className="shrink-0 text-emerald-400" /> {s}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Rack space" hint={`Colocation, power and remote hands are prepaid for ${RACK_PREPAID_MONTHS} months with every order.`} icon={Building} />
          {rows.length === 0 ? (
            <EmptyState title="No servers yet">Each server you own and its prepaid rack space are listed here.</EmptyState>
          ) : (
            <div className="mt-3">
              <MobileList>
                {rows.map(({ server: s, until }) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                    <span className="min-w-0">
                      <span className="block truncate text-[13.5px] font-medium">Server #{s.id}</span>
                      <span className="block truncate text-[11.5px] text-white/40">{s.datacenter}</span>
                    </span>
                    <span className="shrink-0 text-right text-[12.5px] text-white/60">Until {fmtDate(until)}</span>
                  </li>
                ))}
              </MobileList>
              <div className="hidden md:block">
                <Table head={['Server', 'Data center', 'Order', '>Prepaid until']}>
                  {rows.map(({ server: s, until }) => (
                    <tr key={s.id} className="transition-colors hover:bg-white/[0.025]">
                      <td className="px-5 py-3.5 font-medium">Server #{s.id}</td>
                      <td className="px-5 py-3.5 text-white/60">{s.datacenter}</td>
                      <td className="px-5 py-3.5 font-mono text-[12px] text-white/50">{s.order}</td>
                      <td className="px-5 py-3.5 text-right font-medium tabular">{fmtDate(until)}</td>
                    </tr>
                  ))}
                </Table>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 text-[15px] font-semibold">
            <CreditCard size={16} className="text-coco-lilac" /> Purchases
            <InfoTip>Card payments are processed by Stripe. CoCo never stores your card details.</InfoTip>
          </div>
          {paid.length === 0 ? (
            <p className="mt-6 text-[13px] text-white/40">No paid orders yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-white/[0.05] text-[13px]">
              {paid.map((o) => (
                <li key={o.reference} className="flex justify-between gap-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{orderLabel(o)}</span>
                    <span className="block text-[11.5px] text-white/40">{o.reference} · {fmtDate(o.paidAt || o.createdAt)}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-semibold tabular">{usd(o.quote.total)}</span>
                    <a
                      href={`/api/orders/${encodeURIComponent(o.reference)}/invoice.pdf`}
                      className="inline-flex items-center gap-1 text-[11.5px] font-medium text-coco-lilac hover:underline"
                    >
                      <Download size={12} /> Invoice
                    </a>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </motion.div>
  );
}
