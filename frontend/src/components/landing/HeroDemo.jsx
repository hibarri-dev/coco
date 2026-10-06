import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, SquareTerminal, Boxes, Microchip, Gauge, Search, Globe, Code, Database, HardDrive,
  Check, Rocket, ShieldCheck, CirclePause,
} from 'lucide-react';
import DemoWindow from '../ui/DemoWindow';
import Terminal from './Terminal';
import { EASE } from '../ui/motion';

const card = 'rounded-xl border border-white/[0.07] bg-[#0f0e14]';

function Overview() {
  const bars = [46, 58, 63, 52, 71, 68, 84];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          ['Deployments', '1,284', '+18%'],
          ['Avg. utilisation', '81.3%', '+4.2%'],
          ['Spend this month', '$412', '−9%'],
        ].map(([l, v, d]) => (
          <div key={l} className={`${card} p-3.5 sm:p-4`}>
            <div className="text-[11px] text-white/45">{l}</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold tabular">{v}</span>
              <span className="hidden sm:inline text-[11px] text-emerald-300/90">{d}</span>
            </div>
          </div>
        ))}
      </div>
      <div className={`${card} p-4`}>
        <div className="flex items-center justify-between text-[12px]">
          <span className="font-semibold text-white">Last 7 days</span>
          <span className="text-white/45">compute hours per day</span>
        </div>
        <div className="mt-4 flex h-[170px] items-end gap-2 sm:gap-3">
          {bars.map((b, i) => (
            <div key={i} className="flex h-full flex-1 flex-col justify-end gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${b}%` }}
                transition={{ duration: 0.8, delay: i * 0.06, ease: EASE }}
                className="group relative rounded-t-lg bg-gradient-to-t from-coco-purple/60 to-coco-violet hover:to-coco-lilac transition-colors"
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] opacity-0 group-hover:opacity-100 transition">
                  {b * 12}h
                </span>
              </motion.div>
              <span className="text-center text-[10px] text-white/35">{days[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const SERVICES = [
  { icon: Globe, name: 'web', meta: 'web.acme.app', region: 'Dallas', status: 'Live' },
  { icon: Code, name: 'api', meta: 'api.acme.coco.app', region: 'Dallas', status: 'Live' },
  { icon: Microchip, name: 'inference', meta: '1× L40S · 74% util', region: 'Miami', status: 'Live' },
  { icon: Database, name: 'postgres', meta: '3 replicas · 42 GB', region: 'Dallas', status: 'Live' },
  { icon: HardDrive, name: 'object-store', meta: '1.8 TB · S3 compatible', region: 'Ashburn', status: 'Live' },
  { icon: Code, name: 'worker', meta: 'queue · 1.2k jobs/min', region: 'Ashburn', status: 'Deploying' },
];

function Services() {
  const [q, setQ] = useState('');
  const list = SERVICES.filter((s) => `${s.name} ${s.meta} ${s.region}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-3">
      <label className={`${card} flex items-center gap-2.5 px-3.5 py-2.5`}>
        <Search size={15} className="text-white/40" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search services…"
          className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-white/30"
        />
      </label>
      <div className="space-y-2">
        {list.map((s, i) => (
          <motion.div
            key={s.name}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`${card} flex items-center gap-3 px-3.5 py-3 hover:border-white/15 transition-colors`}
          >
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-coco-purple/15 text-coco-lilac">
              <s.icon size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-semibold">{s.name}</div>
              <div className="truncate text-[12px] text-white/45">{s.meta}</div>
            </div>
            <span className="hidden sm:block text-[12px] text-white/40">{s.region}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                s.status === 'Live' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300'
              }`}
            >
              {s.status.toLowerCase()}
            </span>
          </motion.div>
        ))}
        {list.length === 0 && <div className="py-10 text-center text-[13px] text-white/40">No services match "{q}"</div>}
      </div>
    </div>
  );
}

const GPUS = [
  { name: 'NVIDIA L40S', mem: '48 GB', price: '$1.12', avail: 18, total: 24 },
  { name: 'NVIDIA H100', mem: '80 GB', price: '$2.49', avail: 6, total: 16 },
  { name: 'NVIDIA A100', mem: '80 GB', price: '$1.59', avail: 11, total: 12 },
];

function Gpus() {
  const [launched, setLaunched] = useState(null);
  return (
    <div className="space-y-3">
      {GPUS.map((g) => {
        const used = ((g.total - g.avail) / g.total) * 100;
        return (
          <div key={g.name} className={`${card} p-4`}>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/[0.05]">
                <Microchip size={18} className="text-coco-violet" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold">{g.name}</div>
                <div className="text-[12px] text-white/45">{g.mem} · from {g.price}/hr</div>
              </div>
              <button
                onClick={() => setLaunched(g.name)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${
                  launched === g.name ? 'bg-emerald-400/15 text-emerald-300' : 'bg-coco-purple text-white hover:bg-[#ad1fff]'
                }`}
              >
                {launched === g.name ? <Check size={13} /> : <Rocket size={13} />}
                {launched === g.name ? 'Launched' : 'Launch'}
              </button>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div initial={{ width: 0 }} animate={{ width: `${used}%` }} transition={{ duration: 0.9, ease: EASE }} className="h-full rounded-full bg-gradient-to-r from-coco-purple to-coco-lilac" />
              </div>
              <span className="text-[11px] text-white/45 tabular">{g.avail} available</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Usage() {
  return (
    <div className="space-y-3">
      <div className={`${card} p-4 sm:p-5`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[15px] font-semibold">Acme Labs · Pro</div>
            <div className="text-[12px] text-white/45">billing@acme.dev</div>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
            <ShieldCheck size={12} /> verified
          </span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 text-[12px]">
          {[
            ['Metering', 'per second'],
            ['Monthly budget', '$600'],
            ['Saved vs. hyperscaler', '38%'],
          ].map(([l, v]) => (
            <div key={l}>
              <div className="text-white/45">{l}</div>
              <div className="mt-0.5 text-[15px] font-bold">{v}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-3 text-[12px]">
          <span className="text-white/45 w-16">This cycle</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div initial={{ width: 0 }} animate={{ width: '68.7%' }} transition={{ duration: 1.1, ease: EASE }} className="h-full rounded-full bg-coco-violet" />
          </div>
          <span className="font-semibold tabular">$412 / $600</span>
        </div>
      </div>
      <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-white/10 px-4 py-3 text-[12.5px] text-white/55">
        <CirclePause size={15} className="text-coco-violet" />
        Approaching your budget? Non-critical services scale down on their own.
      </div>
    </div>
  );
}

const VIEWS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/overview', render: () => <Overview /> },
  { key: 'deploy', label: 'Deploy', icon: SquareTerminal, path: '/deploy', duration: 11000, render: () => <Terminal /> },
  { key: 'services', label: 'Services', icon: Boxes, path: '/services', render: () => <Services /> },
  { key: 'gpus', label: 'GPUs', icon: Microchip, path: '/gpus', render: () => <Gpus /> },
  { key: 'usage', label: 'Usage', icon: Gauge, path: '/usage', render: () => <Usage /> },
];

export default function HeroDemo() {
  return <DemoWindow host="coco.hibarri.com" views={VIEWS} duration={6500} />;
}
