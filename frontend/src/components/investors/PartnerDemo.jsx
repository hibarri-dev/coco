import { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Server, Users, Wallet, ShoppingCart, Search, ShieldCheck, CalendarClock, Cpu, MemoryStick } from 'lucide-react';
import DemoWindow from '../ui/DemoWindow';
import { EASE } from '../ui/motion';
import { SERVERS, CUSTOMERS, MONTHLY_REVENUE } from '../../data/dashboard';
import { SERVER_PACKAGES, usd } from '../../data/packages';

function useTone(light) {
  return light
    ? { card: 'rounded-xl border border-black/[0.07] bg-white', muted: 'text-black/50', strong: 'text-black', track: 'bg-black/[0.06]', input: 'placeholder:text-black/35 text-black' }
    : { card: 'rounded-xl border border-white/[0.07] bg-[#0f0e14]', muted: 'text-white/45', strong: 'text-white', track: 'bg-white/[0.06]', input: 'placeholder:text-white/30 text-white' };
}

function Portfolio({ light }) {
  const t = useTone(light);
  const max = Math.max(...MONTHLY_REVENUE.map((d) => d.v));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          ["This month's revenue", '$7,120'],
          ['Utilisation', '81.3%'],
          ['Active customers', '146'],
        ].map(([l, v]) => (
          <div key={l} className={`${t.card} p-3.5 sm:p-4`}>
            <div className={`text-[11px] ${t.muted}`}>{l}</div>
            <div className={`mt-1 text-xl sm:text-2xl font-bold tabular ${t.strong}`}>{v}</div>
          </div>
        ))}
      </div>
      <div className={`${t.card} p-4`}>
        <div className="flex items-center justify-between text-[12px]">
          <span className={`font-semibold ${t.strong}`}>Last 6 months</span>
          <span className={t.muted}>revenue per month</span>
        </div>
        <div className="mt-4 flex h-[170px] items-end gap-3">
          {MONTHLY_REVENUE.map((d, i) => (
            <div key={d.m} className="flex h-full flex-1 flex-col justify-end gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.v / max) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.06, ease: EASE }}
                className="group relative rounded-t-lg bg-gradient-to-t from-coco-purple/70 to-coco-violet"
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] text-white opacity-0 group-hover:opacity-100 transition">
                  {usd(d.v)}
                </span>
              </motion.div>
              <span className={`text-center text-[10px] ${t.muted}`}>{d.m}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Servers({ light }) {
  const t = useTone(light);
  return (
    <div className="space-y-2">
      {SERVERS.slice(0, 4).map((s, i) => (
        <motion.div
          key={s.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`${t.card} flex items-center gap-3 px-4 py-3`}
        >
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-coco-purple/15 text-coco-violet">
            <Server size={16} />
          </div>
          <div className="min-w-0 w-36">
            <div className={`text-[13.5px] font-semibold ${t.strong}`}>Server #{s.id}</div>
            <div className={`text-[12px] ${t.muted}`}>{s.location} · {s.cpu} · {s.ram}{s.gpu ? ` · ${s.gpu}` : ''}</div>
          </div>
          <div className="hidden sm:flex flex-1 items-center gap-2">
            <div className={`h-1.5 flex-1 overflow-hidden rounded-full ${t.track}`}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${s.utilization}%` }} transition={{ duration: 0.9, ease: EASE }} className="h-full rounded-full bg-coco-violet" />
            </div>
            <span className={`w-9 text-right text-[12px] tabular ${t.muted}`}>{s.utilization}%</span>
          </div>
          <span className={`ml-auto text-[14px] font-semibold tabular ${t.strong}`}>{usd(s.revenue)}</span>
        </motion.div>
      ))}
    </div>
  );
}

function Customers({ light }) {
  const t = useTone(light);
  const [q, setQ] = useState('');
  const list = CUSTOMERS.filter((c) => `${c.name} ${c.product}`.toLowerCase().includes(q.toLowerCase())).slice(0, 5);
  return (
    <div className="space-y-3">
      <label className={`${t.card} flex items-center gap-2.5 px-3.5 py-2.5`}>
        <Search size={15} className={t.muted} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers…" className={`flex-1 bg-transparent text-[13px] outline-none ${t.input}`} />
      </label>
      <div className={`${t.card} divide-y ${light ? 'divide-black/[0.06]' : 'divide-white/[0.06]'}`}>
        {list.map((c) => (
          <div key={c.id} className="flex items-center gap-3 px-4 py-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-coco-purple/15 text-[11px] font-semibold text-coco-violet">
              {c.name.slice(-1)}
            </span>
            <div className="min-w-0 flex-1">
              <div className={`text-[13.5px] font-semibold ${t.strong}`}>{c.name}</div>
              <div className={`text-[12px] ${t.muted}`}>{c.product}</div>
            </div>
            <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">{c.usage}% usage</span>
            <span className={`w-14 text-right text-[13px] font-semibold tabular ${t.strong}`}>{usd(c.revenue)}</span>
          </div>
        ))}
        {list.length === 0 && <div className={`py-8 text-center text-[13px] ${t.muted}`}>No customers match "{q}"</div>}
      </div>
    </div>
  );
}

function Payouts({ light }) {
  const t = useTone(light);
  return (
    <div className="space-y-3">
      <div className={`${t.card} p-4 sm:p-5`}>
        <div className="flex items-start justify-between">
          <div>
            <div className={`text-[15px] font-semibold ${t.strong}`}>Next payout</div>
            <div className={`text-[12px] ${t.muted}`}>First National Bank •• 4821</div>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-500">
            <ShieldCheck size={12} /> verified
          </span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 text-[12px]">
          {[
            ['Pending', '$4,218'],
            ['Arrives in', '7 days'],
            ['Last month', '$3,962'],
          ].map(([l, v]) => (
            <div key={l}>
              <div className={t.muted}>{l}</div>
              <div className={`mt-0.5 text-[15px] font-bold ${t.strong}`}>{v}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-3 text-[12px]">
          <span className={`w-16 ${t.muted}`}>Cycle</span>
          <div className={`h-2 flex-1 overflow-hidden rounded-full ${t.track}`}>
            <motion.div initial={{ width: 0 }} animate={{ width: '77%' }} transition={{ duration: 1.1, ease: EASE }} className="h-full rounded-full bg-coco-violet" />
          </div>
          <span className={`font-semibold ${t.strong}`}>23 / 30 days</span>
        </div>
      </div>
      <div className={`flex items-center gap-2.5 rounded-xl border border-dashed px-4 py-3 text-[12.5px] ${light ? 'border-black/10 text-black/55' : 'border-white/10 text-white/55'}`}>
        <CalendarClock size={15} className="text-coco-violet" />
        Revenue is collected from customers, reconciled and paid out to you every month.
      </div>
    </div>
  );
}

function Buy({ light, onBuy }) {
  const t = useTone(light);
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {SERVER_PACKAGES.map((p) => (
        <div key={p.id} className={`${t.card} flex flex-col p-4 ${p.featured ? 'ring-1 ring-coco-violet/50' : ''}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[14px] font-semibold ${t.strong}`}>{p.name}</span>
            <span className="text-[11px] font-medium text-amber-500">{p.stock} left</span>
          </div>
          <div className={`mt-1 flex items-center gap-3 text-[11.5px] ${t.muted}`}>
            <span className="flex items-center gap-1"><Cpu size={12} />{p.vcpu} vCPU</span>
            <span className="flex items-center gap-1"><MemoryStick size={12} />{p.ram.split(' ').slice(0, 2).join(' ')}</span>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <div className={`text-lg font-bold tabular ${t.strong}`}>{usd(p.price)}</div>
              <div className="text-[11px] text-coco-violet">≈ {usd(p.revenueLow)}–{usd(p.revenueHigh)}/mo</div>
            </div>
            <button onClick={() => onBuy?.(p)} className="rounded-lg bg-coco-purple px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#ad1fff] transition">
              Buy
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PartnerDemo({ light, onBuy }) {
  const views = [
    { key: 'portfolio', label: 'Portfolio', icon: LayoutDashboard, path: '/portfolio', render: () => <Portfolio light={light} /> },
    { key: 'servers', label: 'Servers', icon: Server, path: '/servers', render: () => <Servers light={light} /> },
    { key: 'customers', label: 'Customers', icon: Users, path: '/customers', render: () => <Customers light={light} /> },
    { key: 'payouts', label: 'Payouts', icon: Wallet, path: '/payouts', render: () => <Payouts light={light} /> },
    { key: 'buy', label: 'Buy servers', icon: ShoppingCart, path: '/buy', render: () => <Buy light={light} onBuy={onBuy} /> },
  ];
  return <DemoWindow host="coco.hibarri.com/dashboard" views={views} light={light} />;
}
