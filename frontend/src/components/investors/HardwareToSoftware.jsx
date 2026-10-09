import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Bot, Code2, Layers, Server, Users } from 'lucide-react';
import { Reveal, EASE } from '../ui/motion';
import { useTheme } from '../../hooks/useTheme';

const PARTS = [
  { label: 'vCPU', color: '#9e00ff' },
  { label: 'RAM', color: '#b54dff' },
  { label: 'SSD', color: '#c98bff' },
  { label: 'NIC', color: '#6a2bb8' },
];
const GPU_VM = 2;
const TENANTS = [
  { icon: Code2, label: 'Developer', sub: 'api-prod' },
  { icon: Bot, label: 'AI agent', sub: 'research' },
  { icon: Code2, label: 'Developer', sub: 'ml-train' },
  { icon: Bot, label: 'Trading bot', sub: 'quant-04' },
];
const PHASES = [
  { icon: Server, t: 'One physical server', ms: 2600 },
  { icon: Layers, t: 'Split into isolated virtual servers', ms: 2800 },
  { icon: Users, t: 'Rented by developers and bots', ms: 3800 },
];

const WIDE = {
  w: 640,
  h: 350,
  chassis: { x: 170, y: 92, w: 300, h: 160 },
  bay: (r, c) => ({ x: 184 + c * 69, y: 104 + r * 35, w: 64, h: 29 }),
  vm: (c) => ({ x: 30 + c * 148, y: 96, w: 136, h: 196 }),
  slot: (r, c) => ({ x: 42 + c * 148, y: 132 + r * 38, w: 112, h: 30 }),
  tenant: (c) => ({ x: 42 + c * 148, y: 30, w: 112, h: 36 }),
  layer: { x: 30, y: 306, w: 580, h: 30 },
};

const COMPACT = {
  w: 360,
  h: 560,
  chassis: { x: 30, y: 190, w: 300, h: 160 },
  bay: (r, c) => ({ x: 44 + c * 69, y: 202 + r * 35, w: 64, h: 29 }),
  vm: (c) => ({ x: 22 + (c % 2) * 166, y: 84 + (c >> 1) * 250, w: 150, h: 176 }),
  slot: (r, c) => ({ x: 34 + (c % 2) * 166, y: 118 + (c >> 1) * 250 + r * 35, w: 126, h: 28 }),
  tenant: (c) => ({ x: 34 + (c % 2) * 166, y: 30 + (c >> 1) * 250, w: 126, h: 36 }),
  layer: { x: 22, y: 520, w: 316, h: 30 },
};

function useWide() {
  const query = '(min-width: 640px)';
  const [wide, setWide] = useState(() => typeof window === 'undefined' || window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setWide(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return wide;
}

function Stage({ phase, light }) {
  const g = useWide() ? WIDE : COMPACT;
  const split = phase > 0;
  const rented = phase > 1;
  const ink = light ? '#0b0a10' : '#ffffff';
  const bayFill = light ? '#e4def0' : '#211d2e';
  const chassisFill = light ? '#f4f1fa' : '#14121c';
  const line = light ? 'rgba(11,10,16,0.12)' : 'rgba(255,255,255,0.10)';
  const t = { duration: 0.9, ease: EASE };

  return (
    <svg viewBox={`0 0 ${g.w} ${g.h}`} className="h-auto w-full" role="img" aria-label="A physical server splitting into four isolated virtual servers that developers and bots rent">
      <motion.g initial={false} animate={{ opacity: split ? 0 : 1 }} transition={{ duration: 0.5 }}>
        <rect x={g.chassis.x - 14} y={g.chassis.y + 6} width={12} height={g.chassis.h - 12} rx={3} fill={bayFill} />
        <rect x={g.chassis.x + g.chassis.w + 2} y={g.chassis.y + 6} width={12} height={g.chassis.h - 12} rx={3} fill={bayFill} />
        <rect x={g.chassis.x} y={g.chassis.y} width={g.chassis.w} height={g.chassis.h} rx={14} fill={chassisFill} stroke={line} />
        <text x={g.chassis.x + g.chassis.w / 2} y={g.chassis.y + g.chassis.h + 30} textAnchor="middle" fontSize={13} fontWeight={600} fill={ink} opacity={0.7}>
          1 physical server
        </text>
      </motion.g>

      {[0, 1, 2, 3].map((c) => {
        const vm = g.vm(c);
        return (
          <motion.g key={`vm-${c}`} initial={false} animate={{ opacity: split ? 1 : 0, scale: split ? 1 : 0.92 }} transition={{ ...t, delay: split ? 0.25 + c * 0.05 : 0 }}>
            <rect x={vm.x} y={vm.y} width={vm.w} height={vm.h} rx={16} fill={chassisFill} stroke={rented ? '#9e00ff' : line} strokeWidth={rented ? 1.5 : 1} />
            <text x={vm.x + 12} y={vm.y + 22} fontSize={12} fontWeight={700} fill={ink}>
              VM {c + 1}
            </text>
            <text x={vm.x + vm.w - 12} y={vm.y + 22} textAnchor="end" fontSize={10.5} fontWeight={600} fill="#9e00ff">
              {c === GPU_VM ? 'GPU' : 'CPU'}
            </text>
          </motion.g>
        );
      })}

      {PARTS.map((part, r) =>
        [0, 1, 2, 3].map((c) => {
          const box = split ? g.slot(r, c) : g.bay(r, c);
          const label = r === 0 && c === GPU_VM ? 'vGPU' : part.label;
          const delay = split ? (c * 4 + r) * 0.025 : (15 - c * 4 - r) * 0.015;
          return (
            <g key={`${r}-${c}`}>
              <motion.rect
                initial={false}
                animate={{ attrX: box.x, attrY: box.y, width: box.w, height: box.h, fill: split ? part.color : bayFill }}
                transition={{ ...t, delay }}
                rx={7}
              />
              <motion.circle
                initial={false}
                animate={{ cx: box.x + box.w - 10, cy: box.y + box.h / 2, opacity: split ? 0 : 1 }}
                transition={{ ...t, delay }}
                r={2.5}
                fill={(r + c) % 3 ? '#34d399' : '#b54dff'}
              />
              <motion.text
                initial={false}
                animate={{ attrX: box.x + 10, attrY: box.y + box.h / 2 + 4, opacity: split ? 1 : 0 }}
                transition={{ ...t, delay: split ? delay + 0.3 : 0 }}
                fontSize={11}
                fontWeight={700}
                fill="#ffffff"
              >
                {label}
              </motion.text>
            </g>
          );
        }),
      )}

      {TENANTS.map((tenant, c) => {
        const box = g.tenant(c);
        const vm = g.vm(c);
        const cx = box.x + box.w / 2;
        return (
          <motion.g key={`tenant-${c}`} initial={false} animate={{ opacity: rented ? 1 : 0, y: rented ? 0 : -10 }} transition={{ ...t, delay: rented ? c * 0.12 : 0 }}>
            <motion.line
              x1={cx}
              x2={cx}
              y1={box.y + box.h}
              y2={vm.y}
              stroke="#9e00ff"
              strokeWidth={2}
              strokeDasharray="4 5"
              animate={rented ? { strokeDashoffset: [0, -18] } : { strokeDashoffset: 0 }}
              transition={rented ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
            />
            <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={18} fill={light ? '#ffffff' : '#1b1527'} stroke="#9e00ff" strokeOpacity={0.5} />
            <tenant.icon x={box.x + 10} y={box.y + 10} size={16} color="#9e00ff" />
            <text x={box.x + 32} y={box.y + 16} fontSize={10.5} fontWeight={700} fill={ink}>
              {tenant.label}
            </text>
            <text x={box.x + 32} y={box.y + 28} fontSize={9.5} fill={ink} opacity={0.55} fontFamily="ui-monospace, monospace">
              {tenant.sub}
            </text>
          </motion.g>
        );
      })}

      <motion.g initial={false} animate={{ opacity: split ? 1 : 0 }} transition={{ ...t, delay: split ? 0.4 : 0 }}>
        <rect x={g.layer.x} y={g.layer.y} width={g.layer.w} height={g.layer.h} rx={10} fill="#9e00ff" fillOpacity={0.1} stroke="#9e00ff" strokeOpacity={0.35} />
        <text x={g.layer.x + g.layer.w / 2} y={g.layer.y + 19} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#9e00ff">
          CoCo virtualization layer · same physical server
        </text>
      </motion.g>
    </svg>
  );
}

export default function HardwareToSoftware() {
  const { light } = useTheme();
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '-120px' });
  const [step, setPhase] = useState(0);
  const phase = reduce ? PHASES.length - 1 : step;

  useEffect(() => {
    if (reduce || !inView) return undefined;
    const timer = setTimeout(() => setPhase((p) => (p + 1) % PHASES.length), PHASES[step].ms);
    return () => clearTimeout(timer);
  }, [step, inView, reduce]);

  return (
    <section id="virtualization" className="mx-auto max-w-[1180px] scroll-mt-20 px-4 pb-28 sm:px-6 sm:pb-36">
      <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
        <Reveal>
          <div className="text-[13px] font-semibold text-coco-violet">Virtualization</div>
          <h2 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            Hardware becomes <span className="text-purple-glow">software</span>
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-[var(--muted)]">
            Hardware becomes software when Coco abstracts the underlying hardware on a server and divides it into isolated virtual environments (virtual servers, vCPUs,
            vGPUs). Each virtual server has its own virtual CPU, memory, storage, and network interface. Developers and bots rent those.
          </p>
          <ol className="mt-8 space-y-1.5">
            {PHASES.map((p, i) => (
              <li key={p.t}>
                <button
                  type="button"
                  onClick={() => setPhase(i)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[15px] transition-colors ${
                    phase === i ? 'bg-[var(--surface-2)] font-semibold text-[var(--ink)]' : 'text-[var(--faint)] hover:text-[var(--ink)]'
                  }`}
                >
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${phase === i ? 'bg-coco-purple text-white' : 'bg-[var(--surface-2)]'}`}>
                    <p.icon size={14} />
                  </span>
                  {p.t}
                </button>
              </li>
            ))}
          </ol>
        </Reveal>
        <Reveal delay={0.08}>
          <div ref={ref} className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-6">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-coco-purple/10 blur-[90px]" />
            <div className="relative">
              <Stage phase={phase} light={light} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
