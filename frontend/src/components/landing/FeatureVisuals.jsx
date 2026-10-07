import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Globe, Lock, Code, Database, Microchip, Server, GitBranch, RotateCcw, Bell, Cpu } from 'lucide-react';

function useTicker(length, ms) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % length), ms);
    return () => clearInterval(id);
  }, [length, ms]);
  return i;
}

const Frame = ({ children, className = '' }) => (
  <div className={`screen relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0c13] ${className}`}>
    <div className="absolute inset-0 bg-dot-grid opacity-60" />
    <div className="relative h-full">{children}</div>
  </div>
);

const LOG = [
  { t: 'Detected Node 22 · pnpm workspace', c: 'text-white/60' },
  { t: 'Restored 14 of 16 cached layers', c: 'text-white/60' },
  { t: 'Built image in 18.4s', c: 'text-white/60' },
  { t: 'Scheduling on dfw-2 · 4 vCPU / 8 GB', c: 'text-coco-lilac' },
  { t: 'Health check passed (200 OK)', c: 'text-white/60' },
  { t: 'Live at api.acme.coco.app', c: 'text-emerald-300' },
];

export function DeployVisual() {
  const step = useTicker(LOG.length + 3, 900);
  const shown = Math.min(step, LOG.length);
  const done = shown === LOG.length;
  return (
    <Frame className="h-[380px] p-6 sm:p-8">
      <div className="grid h-full gap-5 sm:grid-cols-[1.25fr_1fr]">
        <div className="rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-[12.5px] leading-6">
          <div className="mb-3 flex items-center justify-between text-white/40 text-[11px] uppercase tracking-widest">
            <span>Build logs</span>
            <span>#a91f3c2</span>
          </div>
          {LOG.slice(0, shown).map((l, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className={l.c}>
              <span className="text-white/25 mr-2">{String(i + 1).padStart(2, '0')}</span>
              {i === LOG.length - 1 ? '✓ ' : '› '}
              {l.t}
            </motion.div>
          ))}
          {!done && <span className="inline-block h-4 w-2 translate-y-0.5 bg-coco-violet animate-pulse" />}
        </div>
        <div className="flex flex-col justify-center gap-3">
          <div className={`rounded-xl border p-4 transition-all duration-500 ${done ? 'border-emerald-400/30 bg-emerald-400/[0.06]' : 'border-white/10 bg-[#121118]'}`}>
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.06]"><Code size={16} /></div>
              <div>
                <div className="font-semibold">api</div>
                <div className="text-xs text-white/45">main · a91f3c2</div>
              </div>
            </div>
            <div className={`mt-3 flex items-center gap-2 text-[13px] ${done ? 'text-emerald-300' : 'text-amber-300'}`}>
              {done ? <Check size={14} /> : <span className="h-2 w-2 rounded-full bg-amber-300 animate-pulse" />}
              {done ? 'Active' : 'Deploying…'}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#121118] p-4 text-[13px] text-white/55">
            <div className="flex justify-between"><span>Runtime</span><span className="text-white/85">Node 22</span></div>
            <div className="mt-2 flex justify-between"><span>Hardware</span><span className="text-white/85">EPYC 9654</span></div>
            <div className="mt-2 flex justify-between"><span>Region</span><span className="text-white/85">Dallas</span></div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

export function NetworkVisual() {
  const nodes = [
    { x: 9, y: 50, icon: Globe, label: 'Internet' },
    { x: 34, y: 50, icon: Lock, label: 'Edge · TLS' },
    { x: 62, y: 22, icon: Code, label: 'api' },
    { x: 62, y: 78, icon: Server, label: 'worker' },
    { x: 89, y: 22, icon: Database, label: 'postgres' },
    { x: 89, y: 78, icon: Microchip, label: 'gpu-pool' },
  ];
  const edges = [
    [0, 1, false],
    [1, 2, false],
    [1, 3, false],
    [2, 4, true],
    [3, 5, true],
    [2, 3, true],
  ];
  return (
    <Frame className="h-[380px]">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
        {edges.map(([a, b, priv], i) => (
          <line
            key={i}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke={priv ? 'rgba(181,77,255,0.6)' : 'rgba(255,255,255,0.25)'}
            strokeWidth="0.35"
            strokeDasharray="1.4 1.4"
            vectorEffect="non-scaling-stroke"
            style={{ strokeWidth: 1.5 }}
          >
            <animate attributeName="stroke-dashoffset" from="5.6" to="0" dur={`${1 + i * 0.15}s`} repeatCount="indefinite" />
          </line>
        ))}
      </svg>
      {nodes.map((n) => (
        <div key={n.label} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2" style={{ left: `${n.x}%`, top: `${n.y}%` }}>
          <div className="relative grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-[#15141c] shadow-lg">
            <n.icon size={18} className="text-white/85" />
          </div>
          <span className="whitespace-nowrap rounded-md bg-black/60 px-2 py-0.5 text-[11px] text-white/60">{n.label}</span>
        </div>
      ))}
      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 text-[11px]">
        <span className="flex items-center gap-1.5 rounded-full border border-coco-purple/40 bg-coco-purple/10 px-2.5 py-1 text-coco-lilac">
          <span className="h-1.5 w-1.5 rounded-full bg-coco-violet" /> private · *.coco.internal
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-white/55">
          <Lock size={11} /> Auto TLS
        </span>
      </div>
    </Frame>
  );
}

const REGIONS = ['Dallas', 'Miami', 'Ashburn'];

export function ScaleVisual() {
  const t = useTicker(6, 1400);
  const replicas = [1, 2, 3, 5, 7, 9][t];
  const load = [22, 38, 51, 66, 79, 88][t];
  return (
    <Frame className="h-[380px] p-6 sm:p-8">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-white/40">Replicas</div>
          <div className="mt-1 text-4xl font-bold tabular">{replicas}</div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-widest text-white/40">Requests / s</div>
          <div className="mt-1 text-2xl font-semibold tabular text-coco-lilac">{(load * 142).toLocaleString()}</div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3">
        {REGIONS.map((r, ri) => (
          <div key={r} className="rounded-xl border border-white/[0.08] bg-black/40 p-3">
            <div className="text-[11px] text-white/45 mb-2.5">{r}</div>
            <div className="grid grid-cols-3 gap-1.5">
              {Array.from({ length: 9 }).map((_, i) => {
                const idx = i * 3 + ri;
                const on = idx < replicas;
                return (
                  <motion.div
                    key={i}
                    animate={{ opacity: on ? 1 : 0.25, scale: on ? 1 : 0.85 }}
                    transition={{ duration: 0.4 }}
                    className={`aspect-square rounded-md border ${on ? 'border-coco-purple/50 bg-coco-purple/25' : 'border-white/[0.08] bg-white/[0.02]'}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5">
        <div className="flex justify-between text-[11px] text-white/45 mb-1.5"><span>Fleet load</span><span>{load}%</span></div>
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-coco-purple to-coco-lilac" animate={{ width: `${load}%` }} transition={{ duration: 0.8 }} />
        </div>
      </div>
    </Frame>
  );
}

function wave(seed, n = 40) {
  return Array.from({ length: n }, (_, i) => 50 + Math.sin(i / 3 + seed) * 18 + Math.sin(i / 1.3 + seed * 2) * 8);
}

const LOGS = [
  ['200', 'GET /v1/models', '12ms'],
  ['200', 'POST /v1/infer', '84ms'],
  ['201', 'POST /v1/jobs', '31ms'],
  ['200', 'GET /healthz', '2ms'],
  ['429', 'POST /v1/infer', '4ms'],
  ['200', 'GET /v1/usage', '9ms'],
];

export function MonitorVisual() {
  const t = useTicker(1000, 1200);
  const cpu = wave(t / 4);
  const mem = wave(t / 4 + 2).map((v) => v - 14);
  const path = (arr) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i / (arr.length - 1)) * 100} ${100 - v}`).join(' ');
  return (
    <Frame className="h-[380px] p-6">
      <div className="grid h-full gap-4 sm:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col rounded-xl border border-white/10 bg-black/50 p-4">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-white/70 font-medium">Resource usage</span>
            <span className="flex gap-3 text-white/45">
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-3 rounded bg-coco-violet" />CPU</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-3 rounded bg-white/60" />Memory</span>
            </span>
          </div>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-3 w-full flex-1">
            <defs>
              <linearGradient id="mon-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#9e00ff" stopOpacity="0.35" />
                <stop offset="1" stopColor="#9e00ff" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[25, 50, 75].map((y) => (
              <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="rgba(255,255,255,0.06)" vectorEffect="non-scaling-stroke" />
            ))}
            <path d={`${path(cpu)} L100 100 L0 100 Z`} fill="url(#mon-fill)" />
            <path d={path(cpu)} stroke="#b54dff" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" />
            <path d={path(mem)} stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/[0.06] px-3 py-2 text-[12px] text-amber-200/80">
            <Bell size={13} /> Alert: p95 latency above 120ms on api for 2m
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-white/10 bg-black/50 p-4">
            <div className="text-[11px] uppercase tracking-widest text-white/40">This billing cycle</div>
            <div className="mt-1 text-2xl font-bold tabular">${(42.18 + (t % 60) * 0.03).toFixed(2)}</div>
            <div className="mt-2 text-[12px] text-white/45">Metered per second · 61% through cycle</div>
            <div className="mt-2 h-1.5 rounded-full bg-white/[0.06]"><div className="h-full w-[61%] rounded-full bg-coco-violet" /></div>
          </div>
          <div className="flex-1 overflow-hidden rounded-xl border border-white/10 bg-black/50 p-3 font-mono text-[11.5px]">
            <AnimatePresence initial={false}>
              {[0, 1, 2, 3, 4].map((k) => {
                const l = LOGS[(t + k) % LOGS.length];
                return (
                  <motion.div key={`${t}-${k}`} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 py-0.5 text-white/55">
                    <span className={l[0] === '429' ? 'text-amber-300' : 'text-emerald-300/80'}>{l[0]}</span>
                    <span className="flex-1 truncate">{l[1]}</span>
                    <span className="text-white/35">{l[2]}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Frame>
  );
}

const DEPLOYS = [
  { env: 'production', sha: 'a91f3c2', msg: 'Add batch inference endpoint', status: 'Active', tone: 'text-emerald-300' },
  { env: 'production', sha: '7c02e1b', msg: 'Tune connection pool', status: 'Removed', tone: 'text-white/40' },
  { env: 'production', sha: '1fd9a40', msg: 'Upgrade to Node 22', status: 'Removed', tone: 'text-white/40' },
];

export function EvolveVisual() {
  const t = useTicker(3, 2200);
  return (
    <Frame className="h-[380px] p-6 sm:p-8">
      <div className="grid h-full gap-5 sm:grid-cols-2">
        <div className="relative">
          <div className="text-[11px] uppercase tracking-widest text-white/40 mb-4">Environments</div>
          <svg className="absolute left-[15px] top-10 h-[230px] w-10" fill="none">
            <path d="M2 0 V230" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            <path d="M2 70 C 2 90, 26 90, 26 110 V160 C 26 180, 2 180, 2 200" stroke="rgba(181,77,255,0.6)" strokeWidth="2" />
          </svg>
          {[
            { name: 'production', sub: 'main', y: 0, on: true },
            { name: 'pr-128 preview', sub: 'feat/batch-infer', y: 1, on: t >= 1, pr: true },
            { name: 'staging', sub: 'develop', y: 2, on: true },
          ].map((e) => (
            <motion.div
              key={e.name}
              animate={{ opacity: e.on ? 1 : 0.35 }}
              className={`relative mb-4 flex items-center gap-3 rounded-xl border bg-[#121118] p-3 ${e.pr ? 'ml-9 border-coco-purple/40' : 'ml-0 border-white/10'}`}
            >
              <GitBranch size={15} className={e.pr ? 'text-coco-lilac' : 'text-white/60'} />
              <div className="min-w-0">
                <div className="text-[14px] font-medium truncate">{e.name}</div>
                <div className="text-[11px] text-white/45 truncate">{e.sub}</div>
              </div>
              {e.pr && <span className="ml-auto rounded-md bg-coco-purple/20 px-2 py-0.5 text-[10px] text-coco-lilac">auto</span>}
            </motion.div>
          ))}
        </div>
        <div className="rounded-xl border border-white/10 bg-black/50 p-4">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-white/40 mb-3">
            <span>Deploy history</span>
            <Cpu size={12} />
          </div>
          {DEPLOYS.map((d, i) => (
            <div key={d.sha} className="flex items-center gap-3 border-b border-white/[0.06] py-2.5 last:border-0">
              <div className="min-w-0 flex-1">
                <div className="text-[13px] truncate">{d.msg}</div>
                <div className="font-mono text-[11px] text-white/35">{d.sha}</div>
              </div>
              {i === 0 ? (
                <span className={`text-[11px] ${d.tone}`}>{d.status}</span>
              ) : (
                <motion.span
                  animate={t === 2 && i === 1 ? { scale: [1, 1.08, 1], borderColor: 'rgba(181,77,255,0.7)' } : {}}
                  className="flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[11px] text-white/60"
                >
                  <RotateCcw size={11} /> Rollback
                </motion.span>
              )}
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}
