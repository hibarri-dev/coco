import { motion } from 'framer-motion';
import { Landmark, CalendarClock, Wallet, ShieldCheck, Download, ArrowUpRight } from 'lucide-react';
import { Card, CardHeader, PageHeader, Badge, Button, Table, page } from '../../components/dashboard/ui';
import { Bars } from '../../components/dashboard/charts';
import { MobileList } from '../../components/dashboard/tables';
import { PAYOUTS, PORTFOLIO } from '../../data/dashboard';
import { usd } from '../../data/packages';

export default function Payouts() {
  const { upcoming, breakdown, history, bank } = PAYOUTS;
  const totalPaid = history.reduce((a, p) => a + p.amount, 0);
  const net = breakdown.reduce((a, b) => a + b.value, 0);
  const chart = [...history].reverse().map((p) => ({ m: p.period.slice(0, 3), v: p.amount })).concat({ m: 'Sep', v: upcoming.amount });

  return (
    <motion.div {...page}>
      <PageHeader
        title="Payouts"
        sub="Your share of revenue, paid to your bank account every month."
        actions={<Button variant="ghost"><Download size={15} /> Statements</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="relative overflow-hidden p-5 sm:p-6 lg:col-span-2">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-coco-purple/25 blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[13px] text-white/55"><Wallet size={15} /> Pending Payout</div>
              <div className="mt-2 text-4xl font-bold tracking-tight tabular sm:text-5xl">{usd(upcoming.amount)}</div>
              <div className="mt-2 text-[13px] text-white/45">For {upcoming.period}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 backdrop-blur">
              <div className="flex items-center gap-2 text-[12px] text-white/50"><CalendarClock size={14} /> Next Payout</div>
              <div className="mt-1 text-2xl font-bold">{PORTFOLIO.nextPayoutDays} Days</div>
              <div className="text-[12px] text-white/45">{upcoming.date}</div>
            </div>
          </div>
          <div className="relative mt-8">
            <div className="mb-2 flex justify-between text-[12px] text-white/45"><span>Payout history</span><span>{usd(totalPaid)} paid to date</span></div>
            <Bars data={chart} height={150} format={usd} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 text-[15px] font-semibold"><Landmark size={16} className="text-coco-lilac" /> Payout account</div>
          <div className="mt-5 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-transparent p-5">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-semibold">{bank.name}</span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-300"><ShieldCheck size={12} /> Verified</span>
            </div>
            <div className="mt-6 font-mono text-[15px] tracking-[0.2em] text-white/70">•••• •••• {bank.last4}</div>
            <div className="mt-1 text-[12px] text-white/40">Business cheque account</div>
          </div>
          <dl className="mt-5 space-y-3 text-[13px]">
            <div className="flex justify-between"><dt className="text-white/45">Schedule</dt><dd className="font-medium">{bank.schedule}</dd></div>
            <div className="flex justify-between"><dt className="text-white/45">Currency</dt><dd className="font-medium">USD</dd></div>
            <div className="flex justify-between"><dt className="text-white/45">Minimum payout</dt><dd className="font-medium">$100</dd></div>
          </dl>
          <Button variant="ghost" className="mt-5 w-full">Update bank details</Button>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader title="How this payout is calculated" sub={upcoming.period} />
          <dl className="mt-3 px-5 pb-5 text-[13px]">
            {breakdown.map((b, i) => (
              <motion.div
                key={b.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="flex justify-between gap-4 border-b border-white/[0.05] py-3"
              >
                <dt className={i === 0 ? 'font-medium' : 'text-white/55'}>{b.label}</dt>
                <dd className={`font-medium tabular ${b.value < 0 ? 'text-white/55' : ''}`}>{b.value < 0 ? `− ${usd(-b.value)}` : usd(b.value)}</dd>
              </motion.div>
            ))}
            <div className="flex justify-between pt-4 text-[15px]">
              <dt className="font-semibold">Your payout</dt>
              <dd className="font-bold tabular text-coco-lilac">{usd(net)}</dd>
            </div>
          </dl>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader title="Payout history" sub="Deposited to your account" />
          <div className="mt-3">
            <MobileList>
              {history.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold">{p.period}</div>
                    <div className="mt-0.5 text-[12px] text-white/45">Paid {p.date}</div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-[14px] font-semibold tabular">{usd(p.amount)}</span>
                    <Badge>{p.status}</Badge>
                  </div>
                </li>
              ))}
            </MobileList>
            <div className="hidden md:block">
            <Table head={['Payout', 'Period', 'Paid on', 'Status', '>Amount', '']}>
              {history.map((p) => (
                <tr key={p.id} className="group transition-colors hover:bg-white/[0.025]">
                  <td className="px-5 py-3.5 font-mono text-[12px] text-white/60">{p.id}</td>
                  <td className="px-5 py-3.5">{p.period}</td>
                  <td className="px-5 py-3.5 text-white/60">{p.date}</td>
                  <td className="px-5 py-3.5"><Badge>{p.status}</Badge></td>
                  <td className="px-5 py-3.5 text-right font-semibold tabular">{usd(p.amount)}</td>
                  <td className="pr-4"><ArrowUpRight size={15} className="text-white/20 group-hover:text-white/60" /></td>
                </tr>
              ))}
            </Table>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
