import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { ArrowRight, Check, Cpu, HardDrive, MemoryStick, Minus, Network, Plus, Info, Sparkles } from 'lucide-react';
import ServerArt from './ServerArt';
import { COUNTRIES, getCatalog, getCountry } from '../../data/catalog';
import { PACKAGE_TYPES, MIN_SERVERS, RACK_MONTHS, RACK_PER_U_MONTH, COCO_FEE, MARKUP, quote, serversPerRack } from '../../lib/pricing';
import { useVisitor } from '../../lib/visitor';
import { usd } from '../../data/packages';
import { EASE } from '../ui/motion';

function StepTitle({ n, title, sub }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-coco-purple text-[13px] font-bold text-white">{n}</span>
      <div>
        <h3 className="text-[18px] font-bold tracking-tight">{title}</h3>
        {sub && <p className="mt-0.5 text-[13.5px] text-[var(--muted)]">{sub}</p>}
      </div>
    </div>
  );
}

function Row({ label, value, sub, strong, accent }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <div className={strong ? 'font-semibold' : 'text-[var(--muted)]'}>{label}</div>
        {sub && <div className="text-[11.5px] text-[var(--faint)]">{sub}</div>}
      </div>
      <div className={`shrink-0 tabular ${strong ? 'font-bold' : 'font-medium'} ${accent ?? ''}`}>{value}</div>
    </div>
  );
}

function ServerCard({ model, selected, onSelect }) {
  const unit = model.supplierPrice * (1 + MARKUP);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group relative flex h-full flex-col rounded-2xl border p-4 text-left transition-all ${
        selected
          ? 'border-coco-purple bg-[var(--surface)] shadow-[0_18px_50px_-24px_rgba(158,0,255,0.7)] ring-1 ring-coco-purple'
          : 'border-[var(--line)] bg-[var(--surface)] hover:-translate-y-0.5 hover:border-coco-purple/40'
      }`}
    >
      <span
        className={`absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full border transition ${
          selected ? 'border-coco-purple bg-coco-purple text-white' : 'border-[var(--line)] text-transparent'
        }`}
      >
        <Check size={12} strokeWidth={3} />
      </span>
      <div className="grid h-24 place-items-center rounded-xl bg-[#0d0c12] px-3">
        {model.image ? (
          <img src={model.image} alt={model.name} className="max-h-20 w-auto object-contain" loading="lazy" />
        ) : (
          <ServerArt u={model.u} className="w-full max-w-[260px]" />
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="rounded-md bg-coco-purple/10 px-1.5 py-0.5 text-[11px] font-semibold text-coco-violet">{model.u}U</span>
        <span className="text-[11.5px] text-[var(--faint)]">{model.vcpu} vCPU</span>
      </div>
      <div className="mt-1.5 pr-6 text-[15px] font-semibold leading-snug">{model.name}</div>
      <ul className="mt-3 space-y-1.5 text-[12.5px] text-[var(--muted)]">
        <li className="flex items-start gap-2"><Cpu size={13} className="mt-0.5 shrink-0 text-coco-violet" />{model.cpu}</li>
        <li className="flex items-start gap-2"><MemoryStick size={13} className="mt-0.5 shrink-0 text-coco-violet" />{model.ram}</li>
        <li className="flex items-start gap-2"><HardDrive size={13} className="mt-0.5 shrink-0 text-coco-violet" />{model.storage}</li>
        <li className="flex items-start gap-2"><Network size={13} className="mt-0.5 shrink-0 text-coco-violet" />{model.network}</li>
      </ul>
      <div className="mt-auto flex items-end justify-between gap-2 pt-4">
        <div>
          <div className="text-[22px] font-bold tracking-tight tabular">{usd(unit)}</div>
          <div className="text-[11.5px] text-[var(--faint)]">per server</div>
        </div>
      </div>
    </button>
  );
}

export default function PackageBuilder({ ctaLabel = 'Continue to checkout', onContinue, initial = {} }) {
  const visitor = useVisitor();
  const touched = useRef(Boolean(initial.country));
  const [countryId, setCountryId] = useState(initial.country || 'US');
  const [catalog, setCatalog] = useState(null);
  const [modelId, setModelId] = useState(initial.model || null);
  const [pkg, setPkg] = useState(initial.pkg || 'five');
  const [qty, setQty] = useState(initial.qty || 10);
  const root = useRef(null);
  const inView = useInView(root, { margin: '0px 0px -20% 0px' });

  useEffect(() => {
    if (!touched.current && COUNTRIES.some((c) => c.id === visitor.countryCode)) setCountryId(visitor.countryCode);
  }, [visitor.countryCode]);

  useEffect(() => {
    let alive = true;
    setCatalog(null);
    getCatalog(countryId).then((items) => alive && setCatalog(items));
    return () => {
      alive = false;
    };
  }, [countryId]);

  const country = getCountry(countryId);
  const model = catalog?.find((m) => m.id === modelId) ?? catalog?.[0] ?? null;
  const q = model ? quote(model, pkg, qty) : null;
  const unlockTen = q && pkg !== 'rack' && q.qty < 10;

  const chooseCountry = (id) => {
    touched.current = true;
    setCountryId(id);
  };

  const submit = () => model && onContinue?.({ country: country.id, model: model.id, pkg, qty: q.qty });

  return (
    <div ref={root} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
      <div className="min-w-0 space-y-10">
        <section>
          <StepTitle n={1} title="Choose a data center location" sub="Servers are bought in-country and shipped straight to the data center, so there is no cross-border shipping." />
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {COUNTRIES.map((c) => {
              const active = c.id === countryId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => chooseCountry(c.id)}
                  aria-pressed={active}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                    active ? 'border-coco-purple bg-coco-purple/10' : 'border-[var(--line)] bg-[var(--surface)] hover:border-coco-purple/40'
                  }`}
                >
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-bold ${active ? 'bg-coco-purple text-white' : 'bg-[var(--surface-2)] text-[var(--muted)]'}`}>
                    {c.id}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13.5px] font-semibold">{c.name}</span>
                    <span className="block truncate text-[11.5px] text-[var(--faint)]">{c.city}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <StepTitle n={2} title="Pick your server" sub={`Smart Selection servers available from ${country.supplier}. Prices include sourcing and setup.`} />
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {!catalog &&
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-[330px] animate-pulse rounded-2xl border border-[var(--line)] bg-[var(--surface)]" />)}
            {catalog?.map((m, i) => (
              <motion.div key={`${countryId}-${m.id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, ease: EASE }}>
                <ServerCard model={m} selected={model?.id === m.id} onSelect={() => setModelId(m.id)} />
              </motion.div>
            ))}
          </div>
          {catalog?.[0]?.sample && (
            <p className="mt-3 flex items-center gap-1.5 text-[12px] text-[var(--faint)]">
              <Info size={13} /> Sample prices. Live supplier pricing connects once the procurement API is in place.
            </p>
          )}
        </section>

        <section>
          <StepTitle n={3} title="Choose your package" sub={`Every package starts at ${MIN_SERVERS} servers and includes 2 years of rack space.`} />
          <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
            {PACKAGE_TYPES.map((p) => {
              const active = pkg === p.id;
              const detail = p.id === 'rack' && model ? `${serversPerRack(model.u)} × ${model.u}U servers` : p.id === 'five' ? `${MIN_SERVERS} servers · 10% off` : '10+ servers · 15% off';
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPkg(p.id)}
                  aria-pressed={active}
                  className={`rounded-xl border px-4 py-3.5 text-left transition ${
                    active ? 'border-coco-purple bg-coco-purple/10' : 'border-[var(--line)] bg-[var(--surface)] hover:border-coco-purple/40'
                  }`}
                >
                  <div className="text-[15px] font-semibold">{p.label}</div>
                  <div className="text-[12px] text-[var(--muted)]">{p.hint}</div>
                  <div className="mt-2 text-[12px] font-medium text-coco-violet">{detail}</div>
                </button>
              );
            })}
          </div>
          <AnimatePresence initial={false}>
            {pkg === 'custom' && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
                  <span className="text-[14px] font-medium">Number of servers</span>
                  <div className="flex items-center gap-1">
                    <button type="button" aria-label="Fewer servers" onClick={() => setQty((v) => Math.max(MIN_SERVERS, v - 1))} className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--line)] hover:bg-[var(--surface-2)]">
                      <Minus size={15} />
                    </button>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={MIN_SERVERS}
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                      onBlur={() => setQty((v) => Math.max(MIN_SERVERS, Math.round(v) || MIN_SERVERS))}
                      aria-label="Number of servers"
                      className="h-9 w-16 rounded-lg border border-[var(--line)] bg-transparent text-center font-semibold tabular outline-none focus:border-coco-purple"
                    />
                    <button type="button" aria-label="More servers" onClick={() => setQty((v) => Math.max(MIN_SERVERS, v) + 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--line)] hover:bg-[var(--surface-2)]">
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
          <div className="text-[12px] font-semibold uppercase tracking-widest text-coco-violet">Your package</div>
          <div className="mt-1 text-[17px] font-bold leading-snug">{model ? model.name : 'Loading servers…'}</div>
          <div className="text-[12.5px] text-[var(--muted)]">
            {country.name} · {country.city} data center
          </div>

          {q && (
            <>
              <div className="mt-4 divide-y divide-[var(--line)] text-[13.5px]">
                <Row label={`${q.qty} × servers`} sub={`${usd(q.unitPrice)} each`} value={usd(q.serversSubtotal)} />
                <Row label={`Volume discount (${Math.round(q.discountRate * 100)}%)`} sub="Applied to servers" value={`− ${usd(q.discount)}`} accent="text-emerald-500" />
                <Row label="Rack space, 2 years" sub={`${q.rackU}U × $${RACK_PER_U_MONTH}/month × ${RACK_MONTHS} months`} value={usd(q.rackTotal)} />
                <div className="flex items-end justify-between gap-4 pt-4">
                  <span className="font-semibold">Total due today</span>
                  <motion.span key={q.total} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-[28px] font-bold leading-none tracking-tight tabular">
                    {usd(q.total)}
                  </motion.span>
                </div>
              </div>

              {unlockTen && (
                <button
                  type="button"
                  onClick={() => {
                    setPkg('custom');
                    setQty(10);
                  }}
                  className="mt-4 flex w-full items-center gap-2 rounded-xl bg-coco-purple/10 px-3.5 py-2.5 text-left text-[12.5px] font-medium text-coco-violet hover:bg-coco-purple/15"
                >
                  <Sparkles size={14} className="shrink-0" />
                  Add {10 - q.qty} more servers to unlock 15% off
                </button>
              )}

              <div className="mt-5 rounded-2xl bg-[var(--surface-2)] p-4 text-[13px]">
                <div className="text-[11.5px] font-semibold uppercase tracking-widest text-[var(--faint)]">Estimated earnings at maturity</div>
                <div className="mt-2 divide-y divide-[var(--line)]">
                  <Row label="Gross compute sales" sub={`${(model.vcpu * q.qty).toLocaleString('en-US')} vCPU × $0.012/hour`} value={`${usd(q.grossMonthly)}/mo`} />
                  <Row label={`CoCo fee (${COCO_FEE * 100}%)`} value={`− ${usd(q.fee)}/mo`} />
                  <Row label="Your earnings" value={`${usd(q.netMonthly)}/mo`} strong accent="text-emerald-500" />
                </div>
                {q.paybackMonths && (
                  <p className="mt-2 text-[11.5px] leading-relaxed text-[var(--faint)]">
                    About {Math.ceil(q.paybackMonths)} months to recover the total at full utilisation. Servers typically take 10–12 months to reach this level.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={submit}
                className="group mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-coco-purple px-5 py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_32px_-12px_rgba(158,0,255,0.9)] transition hover:bg-[#ad1fff]"
              >
                {ctaLabel}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </>
          )}
        </div>
      </aside>

      <AnimatePresence>
      {q && inView && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.3, ease: EASE }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[var(--surface)]/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden"
        >
          <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11.5px] text-[var(--muted)]">{q.qty} servers · {country.name}</div>
              <div className="text-[18px] font-bold tabular">{usd(q.total)}</div>
            </div>
            <button type="button" onClick={submit} className="flex items-center gap-1.5 rounded-xl bg-coco-purple px-4 py-3 text-[14px] font-semibold text-white">
              Continue <ArrowRight size={15} />
            </button>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
