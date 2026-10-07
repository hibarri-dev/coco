import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { Server, Megaphone, Receipt, Activity, Building, Wallet, Check, Plus, ArrowRight, Zap, CircleCheck, PackageCheck, Truck } from 'lucide-react';
import { Reveal, EASE } from '../ui/motion';

const Eyebrow = ({ children }) => <div className="text-[13px] font-semibold text-coco-violet">{children}</div>;
const Accent = ({ children }) => <span className="text-purple-glow">{children}</span>;

/* ---------- Manifesto (word-by-word scroll reveal) ---------- */

const MANIFESTO = [
  ['CoCo', true], ['turns'], ['capital'], ['into'], ['working'], ['compute.', true], ['You'], ['own'], ['the'], ['servers.'],
  ['We'], ['source'], ['them,'], ['rack'], ['them'], ['in'], ['tier-III'], ['data'], ['centers,', true], ['sell'], ['every'],
  ['spare'], ['vCPU'], ['to'], ['developers,', true], ['and'], ['send'], ['the'], ['revenue'], ['straight'], ['back'], ['to'], ['you.', true],
];

function Word({ children, range, progress, strong }) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <motion.span style={{ opacity }} className={`mr-[0.25em] inline-block ${strong ? 'text-[var(--ink)]' : 'text-[var(--ink)]/80'}`}>
      {children}
    </motion.span>
  );
}

export function Manifesto() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] });
  return (
    <section ref={ref} className="mx-auto max-w-[1100px] px-6 py-28 sm:py-40">
      <Eyebrow>Why CoCo</Eyebrow>
      <p className="mt-6 text-[34px] sm:text-[52px] font-bold leading-[1.12] tracking-tight">
        {MANIFESTO.map(([w, strong], i) => (
          <Word key={i} progress={scrollYProgress} range={[i / MANIFESTO.length, (i + 1) / MANIFESTO.length]} strong={strong}>
            {w}
          </Word>
        ))}
      </p>
    </section>
  );
}

/* ---------- Bento features ---------- */

export function Bento() {
  return (
    <section id="features" className="mx-auto max-w-[1180px] px-6 pb-28 sm:pb-36">
      <div className="grid gap-4 md:grid-cols-3">
        <Reveal className="md:row-span-1">
          <div className="flex h-full flex-col rounded-3xl bg-[#d9c4ff] p-7 text-[#1a0b2e]">
            <h3 className="text-2xl font-bold leading-tight">Real hardware, real ownership</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-[#1a0b2e]/70">Every server is yours on paper and in the rack, with serial numbers in your dashboard.</p>
            <div className="mt-6 space-y-2">
              {[
                ['Core 64 · Ashburn', 'Owned', true],
                ['Racked in IAD-3', 'Tier IV', false],
                ['Burn-in 72h', 'Passed', false],
              ].map(([l, v, on]) => (
                <div key={l} className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[13px] ${on ? 'bg-white shadow-sm' : 'bg-white/50'}`}>
                  <span className="flex items-center gap-2 font-medium"><Server size={14} className="text-coco-purple" />{l}</span>
                  <span className="text-[12px] text-[#1a0b2e]/60">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-[#1b1240] p-7 text-white">
            <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full border border-white/10" />
            <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full border border-white/10" />
            <h3 className="text-2xl font-bold leading-tight">Revenue on autopilot</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-white/60">We meter usage per second, invoice customers and collect payment on your behalf.</p>
            <div className="relative mt-6 space-y-2">
              {[
                ['Metering', 'Per second'],
                ['Invoices issued', '146 / mo'],
                ['Collection rate', '98.2%'],
              ].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between rounded-xl bg-white/[0.06] px-3.5 py-2.5 text-[13px]">
                  <span className="flex items-center gap-2"><Receipt size={14} className="text-coco-lilac" />{l}</span>
                  <span className="rounded-md bg-emerald-400/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="flex h-full flex-col rounded-3xl bg-coco-purple p-7 text-white">
            <h3 className="text-2xl font-bold leading-tight">Customers, found for you</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-white/75">We market CoCo to developers worldwide and place their workloads on your servers.</p>
            <div className="mt-6 rounded-2xl bg-white p-4 text-[#140a24] shadow-xl">
              <div className="text-[13px] font-semibold">New customers this week</div>
              {['Lumen Labs · 8 vCPU', 'Orbital · GPU', 'Northwind · 16 vCPU'].map((c, i) => (
                <motion.div
                  key={c}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.12 }}
                  className="mt-2 flex items-center justify-between rounded-lg bg-[#f4effc] px-3 py-2 text-[12px]"
                >
                  <span>{c}</span>
                  <Check size={13} className="text-coco-purple" />
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Activity, t: 'Live monitoring', d: 'CPU, RAM, GPU, network and uptime for every server, refreshed in real time.' },
          { icon: Building, t: 'Data-center relations', d: 'We negotiate colocation, power and remote hands so you never have to.' },
          { icon: Megaphone, t: 'Marketing included', d: 'CoCo is promoted as a leading NeoCloud across developer networks.' },
          { icon: Wallet, t: 'Monthly payouts', d: 'Net revenue lands in your bank account on the 28th of every month.' },
        ].map((f, i) => (
          <Reveal key={f.t} delay={i * 0.05}>
            <div className="h-full rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 transition-colors hover:border-coco-violet/40">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-coco-purple/15 text-coco-violet"><f.icon size={18} /></span>
              <h3 className="mt-5 text-[17px] font-bold">{f.t}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--muted)]">{f.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- How it works (sticky steps + stacking cards) ---------- */

const STEPS = [
  {
    title: 'Choose a server package',
    body: 'Pick a data center and the hardware that fits your budget. Pay by card or wire transfer and your order is locked in instantly.',
    tone: 'bg-[#d9c4ff] text-[#1a0b2e]',
    rows: [['Core 64', '128 vCPU · 512 GB', 'Selected'], ['Data center', 'Ashburn IAD-3', 'Tier IV'], ['Payment', 'Stripe · card or ACH', 'Paid']],
  },
  {
    title: 'We buy, rack and burn it in',
    body: 'Our team sources the server, installs it in a partner data center and runs 72 hours of stress tests before it goes live.',
    tone: 'bg-[#1b1240] text-white',
    rows: [['Procured', 'From certified supplier', 'Done'], ['Racked', 'Cross-connect + power', 'Done'], ['Burn-in', 'CPU, RAM, disk, network', 'Running']],
  },
  {
    title: 'Developers rent it, you earn',
    body: 'Workloads are scheduled onto your server automatically. Watch utilisation, customers and revenue grow from your dashboard.',
    tone: 'bg-coco-purple text-white',
    rows: [['Utilisation', '81.3% this month', 'Healthy'], ['Customers', '146 active', '+12'], ['Next payout', '$4,218 in 7 days', 'Scheduled']],
  },
];

export function HowItWorks() {
  const refs = useRef([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number(e.target.dataset.i))),
      { rootMargin: '-45% 0px -45% 0px' },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="how" className="mx-auto max-w-[1180px] px-6 pb-28 sm:pb-36">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight leading-[1.05]">
            From purchase to payout <Accent>in three steps</Accent>
          </h2>
          <p className="mt-5 max-w-md text-[17px] leading-relaxed text-[var(--muted)]">
            You bring the capital. We handle hardware, data centers, customers and billing. No technical knowledge required.
          </p>
          <div className="mt-8 space-y-1.5">
            {STEPS.map((s, i) => (
              <button
                key={s.title}
                onClick={() => refs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[15px] transition-colors ${
                  active === i ? 'bg-[var(--surface-2)] font-semibold text-[var(--ink)]' : 'text-[var(--faint)] hover:text-[var(--ink)]'
                }`}
              >
                <span className={`grid h-6 w-6 place-items-center rounded-full text-[12px] font-bold ${active === i ? 'bg-coco-purple text-white' : 'bg-[var(--surface-2)]'}`}>{i + 1}</span>
                {s.title}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          {STEPS.map((s, i) => (
            <div key={s.title} ref={(el) => (refs.current[i] = el)} data-i={i} className="lg:sticky" style={{ top: 120 + i * 24 }}>
              <div className={`rounded-3xl p-7 sm:p-9 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)] ${s.tone}`}>
                <div className="text-[12px] font-semibold uppercase tracking-widest opacity-60">Step {i + 1}</div>
                <h3 className="mt-2 text-2xl sm:text-3xl font-bold">{s.title}</h3>
                <p className="mt-3 max-w-lg text-[15px] leading-relaxed opacity-75">{s.body}</p>
                <div className="mt-7 space-y-2">
                  {s.rows.map(([a, b, c]) => (
                    <div key={a} className={`flex items-center gap-4 rounded-xl px-4 py-3 text-[13px] ${i === 0 ? 'bg-white' : 'bg-white/[0.08]'}`}>
                      <span className="w-24 font-semibold">{a}</span>
                      <span className="flex-1 truncate opacity-60">{b}</span>
                      <span className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${i === 0 ? 'bg-[#efe6ff] text-coco-purple' : 'bg-emerald-400/15 text-emerald-300'}`}>
                        <Check size={11} />{c}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */

const FAQS = [
  ['Do I actually own the server?', 'Yes. Each server is purchased in your name, recorded with its serial number in your dashboard, and remains your asset. CoCo operates it under a management agreement.'],
  ['How are payouts calculated?', 'We collect what developers pay for your servers, keep CoCo’s 20% fee and pay the rest to your bank account on the 28th of every month. Rack space is prepaid for two years, so nothing else is deducted. Every line item is visible under Payouts.'],
  ['What happens if hardware fails?', 'Workloads are moved to other servers automatically. Our team handles repairs through the data center, and parts are covered by manufacturer warranty plus a small hardware reserve.'],
  ['How long until my server earns?', 'Most servers go live within 4–6 days. Shipping to your data center takes 24–72 hours, then configuration, linking to the CoCo cloud and dashboard activation take about a day each. You can watch every stage in your dashboard.'],
  ['Can I sell or exit later?', 'Yes, any time. There is no cancellation fee: click “Disconnect” in your dashboard and you are still paid for that month’s earnings. You can collect the servers from the data center, sell them yourself, or sell them back to us or into the CoCo owners network. If you earn less than a 10% ROI in year one, we buy the server back at cost price.'],
];

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="mx-auto max-w-[1180px] px-6 pb-28 sm:pb-36">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight leading-[1.05]">Everything you need to know</h2>
          <p className="mt-5 text-[17px] text-[var(--muted)]">Still unsure? Explore the partner dashboard with sample data, no commitment needed.</p>
          <Link to="/dashboard" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-coco-purple px-5 py-3 font-semibold text-white hover:bg-[#ad1fff] transition">
            Open demo dashboard <ArrowRight size={16} />
          </Link>
        </div>
        <div className="space-y-3">
          {FAQS.map(([q, a], i) => (
            <div key={q} className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
              <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
                <h3 className="text-[16px] font-semibold">{q}</h3>
                <Plus size={18} className={`shrink-0 text-coco-violet transition-transform duration-300 ${open === i ? 'rotate-45' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}>
                    <p className="px-6 pb-5 text-[15px] leading-relaxed text-[var(--muted)]">{a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */

export function InvestorCta() {
  return (
    <section className="px-3 pb-3">
      <div className="relative overflow-hidden rounded-[28px] px-6 py-24 sm:py-32 text-center text-white">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#3b0a6b,#6d12c9_40%,#9e00ff_70%,#4b1590)] bg-[length:200%_200%] animate-gradient" />
        <div className="absolute inset-0 bg-grain opacity-[0.12] mix-blend-overlay" />
        <Reveal className="relative mx-auto max-w-2xl">
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05]">Own the infrastructure behind the AI boom</h2>
          <p className="mt-5 text-lg text-white/75">Reserve a server today and watch it earn from your dashboard within weeks.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a href="#packages" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-black hover:bg-white/90 transition">
              Browse packages <ArrowRight size={16} />
            </a>
            <a href="mailto:partners@hibarri.com" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3.5 font-semibold hover:bg-white/10 transition">
              Talk to our team
            </a>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] text-white/70">
            {[[Zap, 'Live in 4–6 days'], [PackageCheck, 'Warranty-backed hardware'], [Truck, 'We handle logistics'], [CircleCheck, 'Monthly payouts']].map(([Icon, t]) => (
              <span key={t} className="flex items-center gap-1.5"><Icon size={14} />{t}</span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
