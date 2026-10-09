import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Cloud, Gauge, Route, ShieldCheck } from 'lucide-react';
import { Reveal } from '../ui/motion';
import { useTheme } from '../../hooks/useTheme';

const TIER_SIZE = [0, 4, 6, 8.5, 11];
const HUB_CLEAR = 92;
const RING_GAP = 30;
const JOBS_PER_SERVER_SEC = 0.12;
const DRAIN_PER_CAP_SEC = 0.02;
const SPEED = 240;

const POINTS = [
  { icon: Route, t: 'Capability-aware routing', d: 'Bigger servers with free capacity are offered more work.' },
  { icon: Gauge, t: 'No server sits idle', d: 'Demand is spread across the network, so every owner earns.' },
  { icon: ShieldCheck, t: 'Automatic failover', d: 'If a server goes offline, its workload moves elsewhere.' },
];

function buildServers(w, h) {
  let seed = 11;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.hypot(w, h) / 2;
  const servers = [];
  for (let r = HUB_CLEAR; r < maxR; r += RING_GAP) {
    const count = Math.floor((2 * Math.PI * r) / 26);
    const offset = rand() * Math.PI * 2;
    for (let i = 0; i < count; i++) {
      const a = offset + (i / count) * Math.PI * 2;
      const jr = r + (rand() - 0.5) * 9;
      const x = cx + Math.cos(a) * jr;
      const y = cy + Math.sin(a) * jr;
      if (x < 14 || x > w - 14 || y < 14 || y > h - 14) continue;
      const roll = rand();
      const tier = roll < 0.42 ? 1 : roll < 0.72 ? 2 : roll < 0.9 ? 3 : 4;
      const cap = tier * 2;
      servers.push({ x, y, size: TIER_SIZE[tier], cap, load: rand() * cap * 0.6, flash: 0 });
    }
  }
  return servers;
}

function pickTarget(servers) {
  let total = 0;
  const weights = servers.map((s) => {
    const w = s.cap * Math.max(0.04, 1 - s.load / s.cap);
    total += w;
    return w;
  });
  let roll = Math.random() * total;
  for (let i = 0; i < servers.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return servers[i];
  }
  return servers[servers.length - 1];
}

function spawn(cx, cy, target) {
  const dx = target.x - cx;
  const dy = target.y - cy;
  const dist = Math.hypot(dx, dy);
  const bend = (Math.random() - 0.5) * 0.35 * dist;
  return {
    sx: cx,
    sy: cy,
    // Quadratic control point bent off the straight line so routes fan out like traffic.
    qx: cx + dx / 2 - (dy / dist) * bend,
    qy: cy + dy / 2 + (dx / dist) * bend,
    target,
    t: 0,
    dur: dist / SPEED,
  };
}

const along = (p, t) => {
  const u = 1 - t;
  return [u * u * p.sx + 2 * u * t * p.qx + t * t * p.target.x, u * u * p.sy + 2 * u * t * p.qy + t * t * p.target.y];
};

export default function LoadBalancing() {
  const { light } = useTheme();
  const reduce = useReducedMotion();
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [stats, setStats] = useState({ servers: 0, jobs: 0, util: 0 });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const palette = light
      ? { idle: 'rgba(11,10,16,0.10)', busy: '#9e00ff', packet: '#9e00ff', flash: '#b54dff', ring: 'rgba(158,0,255,0.10)' }
      : { idle: 'rgba(255,255,255,0.10)', busy: '#b54dff', packet: '#e2bfff', flash: '#d9a6ff', ring: 'rgba(217,166,255,0.12)' };

    let w = 0;
    let h = 0;
    let servers = [];
    let packets = [];
    let spawnDebt = 0;
    let arrivals = 0;
    let statsClock = 0;
    let pulse = 0;
    let raf = 0;
    let last = 0;
    let visible = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = wrap.clientWidth;
      h = wrap.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      servers = buildServers(w, h);
      packets = [];
      setStats((s) => ({ ...s, servers: servers.length }));
      draw();
    };

    const draw = () => {
      const cx = w / 2;
      const cy = h / 2;
      ctx.clearRect(0, 0, w, h);

      for (let k = 0; k < 2; k++) {
        const p = (pulse + k / 2) % 1;
        ctx.globalAlpha = 1 - p;
        ctx.strokeStyle = palette.ring;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 40 + p * (HUB_CLEAR + 40), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      for (const s of servers) {
        const half = s.size / 2;
        ctx.fillStyle = palette.idle;
        ctx.fillRect(s.x - half, s.y - half, s.size, s.size);
        ctx.globalAlpha = Math.min(1, s.load / s.cap);
        ctx.fillStyle = palette.busy;
        ctx.fillRect(s.x - half, s.y - half, s.size, s.size);
        if (s.flash > 0) {
          ctx.globalAlpha = s.flash;
          ctx.strokeStyle = palette.flash;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(s.x - half - 2.5, s.y - half - 2.5, s.size + 5, s.size + 5);
        }
        ctx.globalAlpha = 1;
      }

      ctx.fillStyle = palette.packet;
      ctx.strokeStyle = palette.packet;
      ctx.lineWidth = 1.5;
      for (const p of packets) {
        const [x, y] = along(p, p.t);
        const [tx, ty] = along(p, Math.max(0, p.t - 0.08));
        ctx.globalAlpha = 0.45;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = (dt) => {
      pulse = (pulse + dt / 2.4) % 1;
      spawnDebt += servers.length * JOBS_PER_SERVER_SEC * dt;
      while (spawnDebt >= 1 && servers.length) {
        packets.push(spawn(w / 2, h / 2, pickTarget(servers)));
        spawnDebt -= 1;
      }
      packets = packets.filter((p) => {
        p.t += dt / p.dur;
        if (p.t < 1) return true;
        p.target.load += 1;
        p.target.flash = 1;
        arrivals += 1;
        return false;
      });
      let used = 0;
      let cap = 0;
      for (const s of servers) {
        s.load = Math.max(0, s.load - s.cap * DRAIN_PER_CAP_SEC * dt);
        s.flash = Math.max(0, s.flash - dt * 2.5);
        used += Math.min(s.load, s.cap);
        cap += s.cap;
      }
      statsClock += dt;
      if (statsClock >= 1) {
        setStats({ servers: servers.length, jobs: Math.round(arrivals / statsClock), util: cap ? Math.round((used / cap) * 100) : 0 });
        arrivals = 0;
        statsClock = 0;
      }
    };

    const frame = (time) => {
      const dt = last ? Math.min(0.05, (time - last) / 1000) : 0;
      last = time;
      step(dt);
      draw();
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (reduce || raf || !visible) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(wrap);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
    };
  }, [light, reduce]);

  return (
    <section id="load-balancing" className="mx-auto max-w-[1180px] scroll-mt-20 px-4 pb-28 sm:px-6 sm:pb-36">
      <Reveal className="mx-auto max-w-3xl text-center">
        <div className="text-[13px] font-semibold text-coco-violet">Load balancing</div>
        <h2 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
          One cloud, <span className="text-purple-glow">hundreds of servers</span>
        </h2>
        <p className="mt-5 text-[17px] leading-relaxed text-[var(--muted)]">
          Hundreds of private servers receive workload from the central cloud, based on individual server capabilities.
        </p>
      </Reveal>

      <Reveal delay={0.08} className="mt-12">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)]">
          <div ref={wrapRef} className="relative h-[420px] sm:h-[480px]">
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
              <span className="grid h-[72px] w-[72px] place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#c77dff,#9e00ff_55%,#5a0fa8)] text-white shadow-[0_0_60px_10px_rgba(158,0,255,0.35)] ring-4 ring-[var(--surface)]">
                <Cloud size={30} fill="currentColor" />
              </span>
              <span className="mt-2 rounded-full bg-[var(--surface)] px-2.5 py-0.5 text-[12px] font-bold">CoCo cloud</span>
            </div>
            <p className="sr-only">
              Animation: jobs leave the central CoCo cloud and travel to {stats.servers} private servers. Larger servers with spare capacity receive more jobs.
            </p>
          </div>

          <div className="flex flex-col gap-3 border-t border-[var(--line)] px-5 py-4 text-[12.5px] sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3 text-[var(--muted)]">
              <span className="font-semibold text-[var(--ink)]">Server capability</span>
              <span className="flex items-end gap-1.5">
                {TIER_SIZE.slice(1).map((s) => (
                  <span key={s} className="bg-coco-violet" style={{ width: s, height: s }} />
                ))}
              </span>
              <span>small to large</span>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 tabular text-[var(--muted)]">
              <span>
                <b className="font-semibold text-[var(--ink)]">{stats.servers}</b> private servers
              </span>
              <span>
                <b className="font-semibold text-[var(--ink)]">{stats.jobs}</b> jobs routed / sec
              </span>
              <span>
                <b className="font-semibold text-[var(--ink)]">{stats.util}%</b> network utilisation
              </span>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {POINTS.map((p, i) => (
          <Reveal key={p.t} delay={i * 0.05}>
            <div className="h-full rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-coco-purple/15 text-coco-violet">
                <p.icon size={18} />
              </span>
              <h3 className="mt-5 text-[17px] font-bold">{p.t}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--muted)]">{p.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
