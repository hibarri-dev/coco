import { useId, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { EASE } from '../ui/motion';

function smoothPath(points) {
  if (points.length < 2) return '';
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i - 1] ?? points[i];
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const [x3, y3] = points[i + 2] ?? points[i + 1];
    const t = 0.18;
    d += ` C${x1 + (x2 - x0) * t},${y1 + (y2 - y0) * t} ${x2 - (x3 - x1) * t},${y2 - (y3 - y1) * t} ${x2},${y2}`;
  }
  return d;
}

export function AreaChart({ data, height = 220, format = (v) => v, labels }) {
  const id = useId();
  const ref = useRef(null);
  const [hover, setHover] = useState(null);
  const W = 800;
  const H = height;
  const pad = { t: 16, b: 26, l: 8, r: 8 };
  const max = Math.max(...data) * 1.15;
  const pts = useMemo(
    () => data.map((v, i) => [pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r), pad.t + (1 - v / max) * (H - pad.t - pad.b)]),
    [data, max, H],
  );
  const line = smoothPath(pts);
  const area = `${line} L${pts[pts.length - 1][0]},${H - pad.b} L${pts[0][0]},${H - pad.b} Z`;

  const onMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((x - pad.l) / (W - pad.l - pad.r)) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  };

  return (
    <div className="relative">
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" style={{ height }} preserveAspectRatio="none" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9e00ff" stopOpacity="0.35" />
            <stop offset="1" stopColor="#9e00ff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${id}-line`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#9e00ff" />
            <stop offset="1" stopColor="#d9a6ff" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={W} y1={pad.t + f * (H - pad.t - pad.b)} y2={pad.t + f * (H - pad.t - pad.b)} className="stroke-white/[0.06]" vectorEffect="non-scaling-stroke" />
        ))}
        <motion.path d={area} fill={`url(#${id}-fill)`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
        <motion.path
          d={line}
          fill="none"
          stroke={`url(#${id}-line)`}
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: EASE }}
        />
        {hover !== null && (
          <g>
            <line x1={pts[hover][0]} x2={pts[hover][0]} y1={pad.t} y2={H - pad.b} className="stroke-white/20" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
          </g>
        )}
      </svg>
      {hover !== null && (
        <>
          <span
            className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-coco-purple shadow-[0_0_12px_#9e00ff]"
            style={{ left: `${(pts[hover][0] / W) * 100}%`, top: pts[hover][1] }}
          />
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border border-white/10 bg-[#16151d] px-2.5 py-1.5 text-[12px] shadow-xl"
            style={{ left: `${(pts[hover][0] / W) * 100}%`, top: pts[hover][1] - 12 }}
          >
            <div className="text-white/45">{labels ? labels[hover] : `Day ${hover + 1}`}</div>
            <div className="font-semibold tabular">{format(data[hover])}</div>
          </div>
        </>
      )}
    </div>
  );
}

export function Bars({ data, height = 160, format = (v) => v, highlightLast = true }) {
  const max = Math.max(...data.map((d) => d.v), 1);
  return (
    <div className="flex items-end gap-2.5" style={{ height }}>
      {data.map((d, i) => {
        const last = highlightLast && i === data.length - 1;
        return (
          <div key={d.m} className="group flex h-full flex-1 flex-col justify-end gap-2">
            <div className="relative flex-1 flex items-end">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.v / max) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.05, ease: EASE }}
                className={`relative w-full rounded-t-md ${last ? 'bg-gradient-to-t from-coco-purple to-coco-violet' : 'bg-white/[0.09] group-hover:bg-white/[0.16]'} transition-colors`}
              >
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/90 px-1.5 py-0.5 text-[11px] opacity-0 transition-opacity group-hover:opacity-100">
                  {format(d.v)}
                </span>
              </motion.div>
            </div>
            <span className="text-center text-[11px] text-white/40">{d.m}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Ring({ value, size = 120, stroke = 10, label, sub, color = '#9e00ff' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = value ?? 0;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="stroke-white/[0.08]" strokeWidth={stroke} />
        {value !== null && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c * (1 - v / 100) }}
            transition={{ duration: 1.2, ease: EASE }}
            style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
          />
        )}
      </svg>
      <div className="absolute text-center">
        <div className="text-xl font-bold tabular leading-none">{value === null ? '—' : label ?? `${v}%`}</div>
        {sub && <div className="mt-1 text-[11px] text-white/45">{sub}</div>}
      </div>
    </div>
  );
}

export function Sparkline({ data, height = 48, color = '#b54dff' }) {
  const id = useId();
  const W = 200;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => [(i / (data.length - 1)) * W, height - 4 - (v / max) * (height - 8)]);
  const line = smoothPath(pts);
  return (
    <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.3" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${W},${height} L0,${height} Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
