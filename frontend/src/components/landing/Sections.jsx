import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Check, Cpu, Microchip, Server, HardDrive, Quote } from 'lucide-react';
import { Reveal, LiveCounter, Counter } from '../ui/motion';

const QUOTES = [
  {
    quote:
      'We moved our inference stack over in an afternoon. GPU capacity that used to take a week of tickets is now one command, and our bill dropped by a third.',
    name: 'Priya Natarajan',
    role: 'CTO, Lumen Labs',
    stat: '−34% compute spend',
  },
  {
    quote:
      'Private networking just works. Our services found each other on the first deploy and we have not touched a load balancer config since.',
    name: 'Marcus Feld',
    role: 'Staff Engineer, Northwind',
    stat: '9 services migrated',
  },
  {
    quote:
      'Per-second metering changed how we think about batch jobs. We spin up big nodes, finish fast, and only pay for the minutes we actually used.',
    name: 'Sofia Alvarez',
    role: 'Head of Data, Orbital',
    stat: '4.2× faster pipelines',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative mx-auto max-w-[1240px] px-5 lg:px-8 py-24 sm:py-32">
      <Reveal className="max-w-2xl">
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Trusted by teams who ship</h2>
        <p className="mt-4 text-[17px] text-white/55 leading-relaxed">
          From two-person startups to research labs, builders run real production traffic on CoCo every day.
        </p>
      </Reveal>
      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {QUOTES.map((q, i) => (
          <Reveal key={q.name} delay={i * 0.08}>
            <figure className="group relative flex h-full flex-col rounded-2xl border border-white/[0.08] bg-[#0e0d13] p-7 transition-colors hover:border-coco-purple/40">
              <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(400px_circle_at_0%_0%,rgba(158,0,255,0.12),transparent_60%)] opacity-0 transition-opacity group-hover:opacity-100" />
              <Quote size={22} className="text-coco-violet" />
              <blockquote className="relative mt-5 flex-1 text-[16px] leading-relaxed text-white/80">“{q.quote}”</blockquote>
              <div className="relative mt-7 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-5">
                <figcaption className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-coco-violet to-[#2b0750] text-sm font-semibold">
                    {q.name.split(' ').map((n) => n[0]).join('')}
                  </span>
                  <span>
                    <span className="block text-[14px] font-semibold">{q.name}</span>
                    <span className="block text-[12px] text-white/45">{q.role}</span>
                  </span>
                </figcaption>
                <span className="rounded-full bg-coco-purple/10 px-2.5 py-1 text-[11px] font-medium text-coco-lilac whitespace-nowrap">{q.stat}</span>
              </div>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Stats() {
  return (
    <section id="stats" className="relative overflow-hidden border-y border-white/[0.06] bg-[#08070c] py-24 sm:py-32">
      <div className="absolute inset-0 bg-dot-grid opacity-50 mask-fade-b" />
      <div className="absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-coco-purple/10 blur-[120px]" />
      <div className="relative mx-auto max-w-[1240px] px-5 lg:px-8 text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[12px] text-white/60">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse-ring" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Live across the network
          </div>
          <h2 className="mt-6 text-5xl sm:text-7xl font-bold tracking-tight">
            <LiveCounter start={18_402_316} tickMin={40} tickMax={180} interval={900} className="text-silver" />
          </h2>
          <p className="mt-3 text-lg text-white/55">vCPU-hours served in the last 30 days, and counting</p>
        </Reveal>
        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] md:grid-cols-4">
          {[
            { v: 52_840, l: 'Developers', f: (n) => Math.round(n).toLocaleString() },
            { v: 1_260, l: 'Partner servers', f: (n) => Math.round(n).toLocaleString() },
            { v: 99.99, l: 'Uptime SLA', f: (n) => `${n.toFixed(2)}%` },
            { v: 3, l: 'Regions live', f: (n) => Math.round(n).toString() },
          ].map((s) => (
            <div key={s.l} className="bg-[#0b0a10] px-6 py-8">
              <div className="text-3xl font-bold tracking-tight">
                <Counter value={s.v} format={s.f} />
              </div>
              <div className="mt-1 text-[13px] text-white/45">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const RATES = [
  { icon: Cpu, name: 'vCPU', unit: 'per vCPU', hourly: 0.018 },
  { icon: Server, name: 'Memory', unit: 'per GB RAM', hourly: 0.0045 },
  { icon: Microchip, name: 'GPU · L40S', unit: 'per GPU', hourly: 1.12 },
  { icon: HardDrive, name: 'NVMe storage', unit: 'per GB', hourly: 0.00012 },
];

export function Pricing() {
  const [mode, setMode] = useState('hourly');
  const mult = mode === 'hourly' ? 1 : 730;
  const fmt = (n) => (n < 0.01 ? `$${n.toFixed(5)}` : n < 1 ? `$${n.toFixed(3)}` : `$${n.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`);
  return (
    <section id="pricing" className="relative mx-auto max-w-[1240px] px-5 lg:px-8 py-24 sm:py-32">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <Reveal>
          <div className="text-[13px] font-semibold uppercase tracking-[0.2em] text-coco-violet">Pricing</div>
          <h2 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight leading-[1.05]">Meets your budget, wherever it is</h2>
          <p className="mt-5 text-[17px] leading-relaxed text-white/55">
            No reserved instances, no egress surprises. You pay for the exact resources you use, metered per second and billed at the end of each cycle.
          </p>
          <ul className="mt-7 space-y-3 text-[15px] text-white/75">
            {['$5 free credit every month on Hobby', 'Hard spending limits and budget alerts', 'Volume discounts from $1k / month'].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-coco-purple/20"><Check size={12} className="text-coco-lilac" /></span>
                {t}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="rounded-3xl border border-white/[0.08] bg-[#0e0d13] p-3">
            <div className="flex items-center justify-between px-4 pt-3 pb-4">
              <span className="text-[14px] font-semibold">Resource rates</span>
              <div className="relative flex rounded-full bg-white/[0.05] p-1 text-[13px] font-medium">
                {['hourly', 'monthly'].map((m) => (
                  <button key={m} onClick={() => setMode(m)} className={`relative z-10 rounded-full px-4 py-1.5 capitalize transition-colors ${mode === m ? 'text-black' : 'text-white/60 hover:text-white'}`}>
                    {mode === m && <motion.span layoutId="price-pill" className="absolute inset-0 -z-10 rounded-full bg-white" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {RATES.map((r) => (
                <div key={r.name} className="flex items-center gap-4 rounded-2xl bg-white/[0.025] px-5 py-4">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-coco-purple/15 text-coco-lilac"><r.icon size={18} /></span>
                  <div className="flex-1">
                    <div className="text-[15px] font-semibold">{r.name}</div>
                    <div className="text-[12px] text-white/45">{r.unit}</div>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div key={mode} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="text-right">
                      <span className="text-lg font-bold tabular">{fmt(r.hourly * mult)}</span>
                      <span className="text-[12px] text-white/40"> / {mode === 'hourly' ? 'hr' : 'mo'}</span>
                    </motion.div>
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function PartnerBand() {
  return (
    <section id="partners" className="relative mx-auto max-w-[1240px] px-5 lg:px-8 pb-24 sm:pb-32">
      <Reveal>
        <div className="screen relative overflow-hidden rounded-[28px] border border-coco-purple/30 bg-[#0d0716] p-8 sm:p-14">
          <div className="absolute inset-0 bg-[radial-gradient(800px_circle_at_100%_0%,rgba(158,0,255,0.35),transparent_55%)]" />
          <div className="absolute inset-0 bg-grain opacity-[0.07] mix-blend-overlay" />
          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <div className="text-[13px] font-semibold uppercase tracking-[0.2em] text-coco-lilac">Cloud Partner Program</div>
              <h2 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight leading-[1.05]">Own a piece of the cloud</h2>
              <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-white/65">
                Buy real servers, and we handle everything else: sourcing, racking, customers, billing and payouts. You track every dollar from your partner dashboard.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/investors" className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-white/90 transition">
                  Become a partner <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 font-semibold text-white hover:bg-white/[0.06] transition">
                  View demo dashboard
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/50 p-5 backdrop-blur">
              <div className="flex items-center justify-between text-[12px] text-white/45">
                <span>Partner portfolio</span>
                <span className="text-emerald-300">● 8 servers online</span>
              </div>
              <div className="mt-3 text-4xl font-bold tabular">$7,120</div>
              <div className="text-[13px] text-white/45">revenue this month</div>
              <div className="mt-5 flex h-24 items-end gap-1.5">
                {[38, 44, 52, 49, 61, 66, 58, 72, 77, 70, 84, 92].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: i * 0.04 }}
                    className="flex-1 rounded-t bg-gradient-to-t from-coco-purple/50 to-coco-violet"
                  />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-[12px]">
                <div><div className="text-white/45">Utilisation</div><div className="font-semibold text-[15px]">81.3%</div></div>
                <div><div className="text-white/45">Customers</div><div className="font-semibold text-[15px]">146</div></div>
                <div><div className="text-white/45">Next payout</div><div className="font-semibold text-[15px]">7 days</div></div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function FinalCta() {
  return (
    <section id="cta" className="relative overflow-hidden py-28 sm:py-40 text-center">
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-[radial-gradient(60%_80%_at_50%_100%,rgba(158,0,255,0.28),transparent)]" />
      <div
        className="absolute inset-x-0 bottom-0 h-[45%] opacity-30"
        style={{
          backgroundImage: 'linear-gradient(rgba(181,77,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(181,77,255,0.4) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          transform: 'perspective(500px) rotateX(64deg)',
          transformOrigin: 'bottom',
          maskImage: 'linear-gradient(to top, black, transparent 90%)',
        }}
      />
      <Reveal className="relative mx-auto max-w-3xl px-5">
        <h2 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.02]">
          The next era of compute is <span className="text-purple-glow">now online</span>
        </h2>
        <p className="mt-6 text-lg text-white/55">Deploy your first workload in minutes. No credit card required to start.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a href="#" className="group inline-flex items-center gap-2 rounded-xl bg-coco-purple px-6 py-3.5 font-semibold shadow-[0_10px_40px_-10px_rgba(158,0,255,0.9)] hover:bg-[#ad1fff] transition">
            Start deploying <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </a>
          <a href="mailto:sales@hibarri.com" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-6 py-3.5 font-semibold hover:bg-white/[0.07] transition">
            Talk to sales
          </a>
        </div>
      </Reveal>
    </section>
  );
}

export function Featured() {
  const items = [
    { tag: 'Launch', title: 'CoCo GPU Cloud is generally available', body: 'L40S, A100 and H100 nodes on demand, billed per second across three regions.', href: '#features' },
    { tag: 'Partners', title: 'Introducing the Cloud Partner Program', body: 'Own the servers behind the cloud and earn from every vCPU developers rent.', href: '/investors', internal: true },
  ];
  return (
    <section id="featured" className="mx-auto max-w-[1240px] px-5 lg:px-8 pb-24">
      <div className="text-[13px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-5">Featured</div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((it) => {
          const Comp = it.internal ? Link : 'a';
          const props = it.internal ? { to: it.href } : { href: it.href };
          return (
            <Comp key={it.title} {...props} className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e0d13] p-7 transition hover:border-white/20">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-coco-purple/20 blur-3xl opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-white/60">{it.tag}</span>
              <h3 className="mt-5 text-2xl font-bold tracking-tight">{it.title}</h3>
              <p className="mt-2 text-[15px] text-white/55">{it.body}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-white/80 group-hover:text-white">
                Read more <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </Comp>
          );
        })}
      </div>
    </section>
  );
}
