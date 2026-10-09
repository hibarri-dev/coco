import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, SquareTerminal, Boxes, Microchip, Gauge, Search, Globe, Code, Database, HardDrive,
  Check, Rocket,
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

const VCPU_LIMIT = 16;
const MEM_LIMIT_GB = 32;
const WINDOW_SEC = 60;
// [service, share of vCPU, share of memory]
const USAGE_SPLIT = [
  ['api', 0.38, 0.29],
  ['worker', 0.27, 0.24],
  ['web', 0.19, 0.1],
  ['postgres', 0.16, 0.37],
];

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// Mean-reverting random walk with occasional load spikes, so the lines read like real telemetry.
const nextCpu = (v) => clamp(v + (10.9 - v) * 0.18 + (Math.random() - 0.5) * 1.6 + (Math.random() < 0.06 ? 2.6 : 0), 5.2, 15.6);
const nextMem = (v) => clamp(v + (21.7 - v) * 0.08 + (Math.random() - 0.48) * 0.6 + (Math.random() < 0.05 ? 1.4 : 0), 19, 27);

function seed(next, start) {
  const out = [start];
  while (out.length < WINDOW_SEC) out.push(next(out[out.length - 1]));
  return out;
}

function useLiveUsage() {
  const [state, setState] = useState(() => ({ tick: 0, cpu: seed(nextCpu, 10.4), mem: seed(nextMem, 21.3) }));
  useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden) return;
      setState(({ tick, cpu, mem }) => ({
        tick: tick + 1,
        cpu: [...cpu.slice(1), nextCpu(cpu[cpu.length - 1])],
        mem: [...mem.slice(1), nextMem(mem[mem.length - 1])],
      }));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return state;
}

function LiveChart({ id, data, max, color }) {
  const W = 300;
  const H = 80;
  const line = data.map((v, i) => `${i ? 'L' : 'M'}${((i / (data.length - 1)) * W).toFixed(1)},${(H - (v / max) * H).toFixed(1)}`).join('');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-[56px] w-full sm:h-[60px]" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="rgba(255,255,255,0.07)" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
      ))}
      <path d={`${line}L${W},${H}L0,${H}Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function MetricCard({ id, label, value, total, unit, data, color }) {
  const pct = (value / total) * 100;
  return (
    <div className={`${card} p-3.5`}>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-white/45">{label}</span>
        <span className={`tabular font-medium ${pct > 85 ? 'text-amber-300' : 'text-white/55'}`}>{pct.toFixed(1)}%</span>
      </div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className="text-lg font-bold tabular sm:text-xl">{value.toFixed(unit === 'GB' ? 1 : 2)}</span>
        <span className="text-[11.5px] text-white/40">
          / {total} {unit}
        </span>
      </div>
      <div className="mt-2">
        <LiveChart id={id} data={data} max={total} color={color} />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-white/30">
        <span>60s ago</span>
        <span>now</span>
      </div>
    </div>
  );
}

function UsageBar({ value, max, className }) {
  return (
    <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.06]">
      <div className={`h-full rounded-full transition-[width] duration-700 ${className}`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  );
}

function Usage() {
  const { tick, cpu, mem } = useLiveUsage();
  const cpuNow = cpu[cpu.length - 1];
  const memNow = mem[mem.length - 1];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[14px] font-semibold">acme-prod · bare metal</div>
          <div className="truncate text-[11.5px] text-white/45">Dell PowerEdge R670 · Dallas, TX</div>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Live · 1s
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <MetricCard id="usage-cpu" label="vCPU" value={cpuNow} total={VCPU_LIMIT} unit="vCPU" data={cpu} color="#b54dff" />
        <MetricCard id="usage-mem" label="Memory" value={memNow} total={MEM_LIMIT_GB} unit="GB" data={mem} color="#c0c0c0" />
      </div>

      <div className={`${card} px-3.5 py-2`}>
        <div className="grid grid-cols-[1fr_1fr_1fr] gap-4 pb-1.5 text-[10.5px] uppercase tracking-wider text-white/35">
          <span>Service</span>
          <span>vCPU</span>
          <span>Memory</span>
        </div>
        {USAGE_SPLIT.map(([name, cpuShare, memShare], i) => {
          const jitter = 1 + Math.sin(tick * 0.9 + i * 1.7) * 0.06;
          const c = cpuNow * cpuShare * jitter;
          const m = memNow * memShare;
          return (
            <div key={name} className="grid grid-cols-[1fr_1fr_1fr] items-center gap-4 border-t border-white/[0.05] py-1.5 text-[12px]">
              <span className="truncate font-medium">{name}</span>
              <div className="tabular">
                {c.toFixed(2)}
                <UsageBar value={c} max={VCPU_LIMIT / 2} className="bg-coco-violet" />
              </div>
              <div className="tabular">
                {m.toFixed(1)} GB
                <UsageBar value={m} max={MEM_LIMIT_GB / 2} className="bg-coco-silver" />
              </div>
            </div>
          );
        })}
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
