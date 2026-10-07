import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Check, Cpu, MemoryStick, HardDrive, Network, Microchip, MapPin, Truck, ShieldCheck, Package } from 'lucide-react';
import { Card, CardHeader, PageHeader, Button, page } from '../../components/dashboard/ui';
import CheckoutModal from '../../components/CheckoutModal';
import { SERVER_PACKAGES, usd } from '../../data/packages';
import { ORDERS, ORDER_STEPS } from '../../data/dashboard';

function OrderTracker({ order }) {
  return (
    <Card>
      <CardHeader
        title={`Order ${order.id} · ${order.package}`}
        sub={`Placed ${order.placed} · ${order.location} · ${usd(order.amount)}`}
        icon={Truck}
        action={<span className="rounded-full bg-coco-purple/15 px-2.5 py-1 text-[12px] font-medium text-coco-lilac">In progress</span>}
      />
      <div className="px-4 pb-5 pt-7 sm:px-5 sm:pb-6">
        <div className="relative flex justify-between">
          <div className="absolute left-6 right-6 top-4 h-[2px] bg-white/[0.08] sm:left-8 sm:right-8">
            <motion.div
              className="h-full bg-gradient-to-r from-coco-purple to-coco-violet"
              initial={{ width: 0 }}
              animate={{ width: `${(order.step / (ORDER_STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          {ORDER_STEPS.map((s, i) => {
            const done = i < order.step;
            const current = i === order.step;
            return (
              <div key={s} className="relative flex w-12 flex-col items-center gap-2 text-center sm:w-16">
                <span
                  className={`grid h-8 w-8 place-items-center rounded-full border text-[12px] font-semibold ${
                    done ? 'border-coco-purple bg-coco-purple' : current ? 'border-coco-violet bg-[#1a0b2a] text-coco-lilac' : 'border-white/10 bg-[#0e0d13] text-white/40'
                  }`}
                >
                  {done ? <Check size={14} /> : i + 1}
                  {current && <span className="absolute h-8 w-8 animate-ping rounded-full border border-coco-violet/60" />}
                </span>
                <span className={`whitespace-nowrap text-[10.5px] sm:text-[12px] ${done || current ? 'text-white' : 'text-white/40'}`}>{s}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-6 rounded-xl bg-white/[0.03] px-4 py-3 text-[12.5px] text-white/55">
          Your server is being racked in {order.location}. Burn-in testing starts next, then it goes live and starts earning. Expected online: <span className="font-semibold text-white">Oct 9, 2026</span>.
        </p>
      </div>
    </Card>
  );
}

export default function BuyServers() {
  const [buying, setBuying] = useState(null);

  return (
    <motion.div {...page}>
      <PageHeader
        title="Buy Servers"
        sub="Pick a package and pay securely. We procure, rack and manage it, then it shows up in your portfolio."
      />

      {ORDERS.map((o) => <OrderTracker key={o.id} order={o} />)}

      <div className="mt-8 mb-4 flex items-center gap-2 text-[15px] font-semibold"><Package size={16} className="text-coco-lilac" /> Available packages</div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {SERVER_PACKAGES.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }}>
            <Card className={`relative flex h-full flex-col overflow-hidden p-5 ${p.featured ? 'border-coco-purple/40' : ''}`}>
              {p.featured && (
                <>
                  <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-coco-purple/25 blur-3xl" />
                  <span className="absolute right-4 top-4 rounded-full bg-coco-purple px-2 py-0.5 text-[10.5px] font-semibold">Most popular</span>
                </>
              )}
              <div className="relative">
                <div className="text-[17px] font-bold">{p.name}</div>
                <div className="mt-0.5 text-[12.5px] text-white/45">{p.tagline}</div>
                <div className="mt-4 text-3xl font-bold tracking-tight tabular">{usd(p.price)}</div>
                <div className="text-[12px] text-white/40">one-time hardware purchase</div>
                <div className="mt-4 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] px-3.5 py-2.5">
                  <div className="text-[11.5px] text-emerald-300/80">Est. revenue / month</div>
                  <div className="text-[15px] font-semibold text-emerald-200 tabular">{usd(p.revenueLow)} – {usd(p.revenueHigh)}</div>
                </div>
                <ul className="mt-4 space-y-2 text-[12.5px] text-white/65">
                  <li className="flex items-center gap-2"><Cpu size={14} className="text-white/35" />{p.cores} cores · {p.vcpu} vCPU</li>
                  <li className="flex items-center gap-2"><MemoryStick size={14} className="text-white/35" />{p.ram}</li>
                  <li className="flex items-center gap-2"><HardDrive size={14} className="text-white/35" />{p.storage}</li>
                  <li className="flex items-center gap-2"><Network size={14} className="text-white/35" />{p.network}</li>
                  {p.gpu && <li className="flex items-center gap-2"><Microchip size={14} className="text-coco-lilac" />{p.gpu}</li>}
                  <li className="flex items-center gap-2"><MapPin size={14} className="text-white/35" />{p.locations.join(' · ')}</li>
                </ul>
              </div>
              <div className="relative mt-auto pt-5">
                <div className="mb-3 flex justify-between text-[11.5px] text-white/40">
                  <span><span className={p.stock <= 2 ? 'text-amber-300' : 'text-white/70'}>{p.stock} in stock</span></span>
                  <span>Online in {p.leadTime}</span>
                </div>
                <Button variant={p.featured ? 'primary' : 'white'} className="w-full" onClick={() => setBuying(p)}>Buy {p.name}</Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-2.5 text-[12px] leading-relaxed text-white/35">
        <ShieldCheck size={15} className="mt-0.5 shrink-0" />
        Payments are processed by Stripe. Revenue estimates are based on current network utilization and are not guaranteed. Hardware is covered by a 3-year warranty and owned by you.
      </div>

      {buying && createPortal(<CheckoutModal pkg={buying} onClose={() => setBuying(null)} />, document.body)}
    </motion.div>
  );
}
