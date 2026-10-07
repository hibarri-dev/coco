import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Plus, Quote } from 'lucide-react';
import { Reveal, EASE } from '../ui/motion';
import { TESTIMONIALS, FAQ } from '../../data/funnel';
import { COMPANIES } from '../../config/funnel';

const initials = (name) =>
  name
    .split(/\s|&/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export function InvestCta({ to = '/live/offer', className = '' }) {
  return (
    <Link
      to={to}
      className={`group inline-flex items-center justify-center gap-2 rounded-xl bg-coco-purple px-7 py-4 text-[16px] font-semibold text-white shadow-[0_14px_40px_-12px_rgba(158,0,255,0.9)] transition hover:bg-[#ad1fff] ${className}`}
    >
      Start my investment journey!
      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

export function Testimonials() {
  return (
    <section className="mx-auto max-w-[1180px] px-6 py-20 sm:py-28">
      <Reveal className="text-center">
        <div className="text-[13px] font-semibold text-coco-violet">Testimonials</div>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">Partners who own their compute</h2>
      </Reveal>
      <div className="mt-12 columns-1 gap-4 md:columns-2 lg:columns-3 [&>*]:mb-4">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.name} delay={(i % 3) * 0.06} className="break-inside-avoid">
            <figure className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6">
              <Quote size={22} className="text-coco-violet" />
              <blockquote className="mt-3 text-[15.5px] leading-relaxed">“{t.quote}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-coco-violet to-[#2b0750] text-[12px] font-semibold text-white">
                  {initials(t.name)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold">{t.name}</span>
                  <span className="block truncate text-[12.5px] text-[var(--muted)]">
                    {[t.role, t.location].filter(Boolean).join(' · ')}
                  </span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Companies() {
  if (!COMPANIES.length && !import.meta.env.DEV) return null;
  const items = COMPANIES.length ? COMPANIES : Array.from({ length: 6 }, (_, i) => ({ name: `Logo ${i + 1}`, placeholder: true }));
  return (
    <section className="border-y border-[var(--line)] py-12">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="text-center text-[12px] font-semibold uppercase tracking-[0.2em] text-[var(--faint)]">Companies we've worked with</div>
        <div className="mt-6 grid grid-cols-2 items-center gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((c) =>
            c.logo ? (
              <img key={c.name} src={c.logo} alt={c.name} className="mx-auto h-8 w-auto opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
            ) : (
              <div key={c.name} className="grid h-12 place-items-center rounded-xl border border-dashed border-[var(--line)] text-[12px] text-[var(--faint)]">
                {c.placeholder ? 'Client logo' : c.name}
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function Answer({ item }) {
  if (item.type === 'timeline') {
    return (
      <ol className="relative ml-1 space-y-4 border-l border-[var(--line)] pl-6">
        {item.items.map(([step, time], i) => (
          <li key={step} className="relative">
            <span className="absolute -left-[33px] grid h-5 w-5 place-items-center rounded-full bg-coco-purple text-[10px] font-bold text-white">{i + 1}</span>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <span className="text-[15px] leading-snug">{step}</span>
              <span className="shrink-0 rounded-full bg-coco-purple/10 px-2.5 py-0.5 text-[12px] font-semibold text-coco-violet">{time}</span>
            </div>
          </li>
        ))}
      </ol>
    );
  }
  if (item.type === 'returns') {
    return (
      <div className="space-y-4">
        {item.items.map((p) => (
          <p key={p} className="text-[15px] leading-relaxed text-[var(--muted)]">{p}</p>
        ))}
        <div className="grid gap-3 sm:grid-cols-2">
          {item.figures.map(([label, value, sub]) => (
            <div key={label} className="rounded-2xl bg-[var(--surface-2)] p-4">
              <div className="text-[12.5px] text-[var(--muted)]">{label}</div>
              <div className="mt-1 text-2xl font-bold tabular text-coco-violet">{value}</div>
              <div className="text-[12px] text-[var(--faint)]">{sub}</div>
            </div>
          ))}
        </div>
        <p className="text-[12.5px] leading-relaxed text-[var(--faint)]">{item.note}</p>
      </div>
    );
  }
  return (
    <ul className="space-y-2.5">
      {item.items.map((p, i) => (
        <li key={p} className="flex gap-3 text-[15px] leading-relaxed text-[var(--muted)]">
          {item.type === 'steps' ? (
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-coco-purple/10 text-[11px] font-bold text-coco-violet">{i + 1}</span>
          ) : (
            <Check size={16} className="mt-1 shrink-0 text-coco-violet" />
          )}
          <span>{p}</span>
        </li>
      ))}
    </ul>
  );
}

export function FunnelFaq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="mx-auto max-w-[920px] px-6 py-20 sm:py-28">
      <Reveal className="text-center">
        <div className="text-[13px] font-semibold text-coco-violet">Q&A</div>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">Your questions, answered</h2>
      </Reveal>
      <div className="mt-12 space-y-3">
        {FAQ.map((item, i) => (
          <div key={item.q} className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
            <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6">
              <h3 className="text-[16px] font-semibold">{item.q}</h3>
              <Plus size={18} className={`shrink-0 text-coco-violet transition-transform duration-300 ${open === i ? 'rotate-45' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}>
                  <div className="px-5 pb-6 sm:px-6">
                    <Answer item={item} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
