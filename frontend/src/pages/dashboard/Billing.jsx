import { motion } from 'framer-motion';
import { Gauge, FileText, CircleCheck, Building, CreditCard, Download, Sparkles } from 'lucide-react';
import { Card, CardHeader, PageHeader, Stat, Badge, Button, Table, page } from '../../components/dashboard/ui';
import { Ring } from '../../components/dashboard/charts';
import { BILLING } from '../../data/dashboard';
import { usd } from '../../data/packages';

const SERVICES = [
  'Customer acquisition & marketing',
  'Metering & usage-based invoicing',
  'Payment collection & retries',
  'Workload scheduling across servers',
  'Data-center relations & remote hands',
];

export default function Billing() {
  const { cycle, costs, card } = BILLING;
  const due = costs.filter((c) => c.status === 'Due').reduce((a, c) => a + c.amount, 0);

  return (
    <motion.div {...page}>
      <PageHeader
        title="Billing"
        sub="Customer invoicing CoCo runs for you, and the costs of running your servers."
        actions={<Button variant="ghost"><Download size={15} /> Tax documents</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-semibold">Current billing cycle</span>
            <Gauge size={16} className="text-white/30" />
          </div>
          <div className="mt-5 flex items-center gap-5">
            <Ring value={cycle.metered} size={120} stroke={10} label={`${cycle.metered}%`} sub="metered" />
            <div className="space-y-3 text-[13px]">
              <div><div className="text-white/45">Cycle</div><div className="font-semibold">{cycle.start} – {cycle.end}</div></div>
              <div><div className="text-white/45">Days left</div><div className="font-semibold">{cycle.daysLeft} days</div></div>
            </div>
          </div>
          <p className="mt-5 text-[12.5px] leading-relaxed text-white/45">
            Usage is metered per second on every server. Customer invoices go out automatically on {cycle.end}.
          </p>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          <Stat label="Invoices issued for you" value={BILLING.invoicesIssued} sub="Last cycle, in your name" icon={FileText} accent />
          <Stat label="Collected on time" value={`${BILLING.collectedRate}%`} sub="CoCo chases the rest" icon={CircleCheck} />
          <Card className="col-span-2 p-5">
            <div className="flex items-center gap-2 text-[15px] font-semibold"><Sparkles size={16} className="text-coco-lilac" /> Handled by CoCo</div>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {SERVICES.map((s) => (
                <div key={s} className="flex items-center gap-2.5 text-[13px] text-white/70">
                  <CircleCheck size={15} className="shrink-0 text-emerald-400" /> {s}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Server costs"
            sub="Data-center and hardware invoices, deducted from your payout"
            icon={Building}
            action={due > 0 && <span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-[12px] text-amber-300">{usd(due)} due</span>}
          />
          <div className="mt-3">
            <Table head={['Invoice', 'Date', 'Item', 'Status', '>Amount']}>
              {costs.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-white/[0.025]">
                  <td className="px-5 py-3.5 font-mono text-[12px] text-white/60">{c.id}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-white/60">{c.date}</td>
                  <td className="px-5 py-3.5">{c.item}</td>
                  <td className="px-5 py-3.5"><Badge>{c.status}</Badge></td>
                  <td className="px-5 py-3.5 text-right font-semibold tabular">{usd(c.amount)}</td>
                </tr>
              ))}
            </Table>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 text-[15px] font-semibold"><CreditCard size={16} className="text-coco-lilac" /> Payment method</div>
          <p className="mt-1 text-[12.5px] text-white/45">Used for server purchases and any costs your payout doesn't cover.</p>
          <motion.div
            whileHover={{ rotateX: 6, rotateY: -8 }}
            style={{ transformPerspective: 800 }}
            className="relative mt-5 aspect-[1.6] overflow-hidden rounded-2xl bg-gradient-to-br from-[#5b00a3] via-[#2a0a4a] to-black p-5 shadow-[0_20px_50px_-20px_rgba(158,0,255,0.7)]"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold tracking-widest text-white/70">COCO PARTNER</span>
                <span className="text-[15px] font-bold italic">{card.brand.toUpperCase()}</span>
              </div>
              <div>
                <div className="font-mono text-[16px] tracking-[0.2em]">•••• •••• •••• {card.last4}</div>
                <div className="mt-2 flex justify-between text-[11px] text-white/60"><span>ANJE KRUGER</span><span>EXP {card.exp}</span></div>
              </div>
            </div>
          </motion.div>
          <Button variant="ghost" className="mt-5 w-full">Replace card</Button>
        </Card>
      </div>
    </motion.div>
  );
}
