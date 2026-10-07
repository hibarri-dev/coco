import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Banknote, CreditCard, ShieldCheck, CircleCheck, Info, ArrowLeft, Copy, Check } from 'lucide-react';
import FunnelLayout from '../../components/funnel/FunnelLayout';
import CallbackButton from '../../components/funnel/CallbackButton';
import { Field } from '../../components/funnel/Modal';
import { getCatalog, getCountry } from '../../data/catalog';
import { quote, selectionFromQuery, RACK_MONTHS } from '../../lib/pricing';
import { getRegistration } from '../../lib/broadcast';
import { submitLead } from '../../lib/leads';
import { BANK, ENDPOINTS } from '../../config/funnel';
import { FAQ } from '../../data/funnel';
import { usd } from '../../data/packages';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const newReference = () => `CC-${Date.now().toString(36).slice(-5).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;

function Section({ title, sub, children }) {
  return (
    <section className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7">
      <h2 className="text-[18px] font-bold">{title}</h2>
      {sub && <p className="mt-1 text-[13.5px] text-[var(--muted)]">{sub}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Summary({ model, country, q }) {
  return (
    <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="text-[12px] font-semibold uppercase tracking-widest text-coco-violet">Order summary</div>
      <div className="mt-1 text-[16px] font-bold leading-snug">{q.qty} × {model.name}</div>
      <div className="text-[12.5px] text-[var(--muted)]">
        {country.city}, {country.name} · {q.usedU}U of rack space{q.rackU !== q.usedU ? ` (full ${q.rackU}U rack reserved)` : ''}
      </div>
      <dl className="mt-4 divide-y divide-[var(--line)] text-[13.5px]">
        <div className="flex justify-between py-2.5"><dt className="text-[var(--muted)]">Servers ({usd(q.unitPrice)} each)</dt><dd className="tabular">{usd(q.serversSubtotal)}</dd></div>
        <div className="flex justify-between py-2.5"><dt className="text-[var(--muted)]">Volume discount ({Math.round(q.discountRate * 100)}%)</dt><dd className="tabular text-emerald-500">− {usd(q.discount)}</dd></div>
        <div className="flex justify-between py-2.5"><dt className="text-[var(--muted)]">Rack space, {RACK_MONTHS} months</dt><dd className="tabular">{usd(q.rackTotal)}</dd></div>
        <div className="flex items-end justify-between pt-4"><dt className="font-semibold">Total</dt><dd className="text-[26px] font-bold leading-none tracking-tight tabular">{usd(q.total)}</dd></div>
      </dl>
      <div className="mt-4 rounded-2xl bg-[var(--surface-2)] px-4 py-3 text-[12.5px] text-[var(--muted)]">
        Estimated earnings at maturity: <b className="font-semibold text-emerald-500">{usd(q.netMonthly)}/month</b> after CoCo's 20% fee. Not guaranteed.
      </div>
    </div>
  );
}

function CopyValue({ value }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard?.writeText(value).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })}
      className="ml-2 inline-grid h-7 w-7 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-2)]"
      aria-label="Copy"
    >
      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
    </button>
  );
}

function Confirmation({ order, q }) {
  const timeline = FAQ[0].items.slice(2);
  const bankRows = [
    ['Account name', BANK.accountName],
    ['Bank', BANK.bankName],
    ['Account / IBAN', BANK.account],
    ['SWIFT / BIC', BANK.swift],
  ].filter(([, v]) => v);
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl">
      <div className="text-center">
        <CircleCheck size={44} className="mx-auto text-emerald-500" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Order {order.reference} received</h1>
        <p className="mt-2 text-[15px] text-[var(--muted)]">We'll email your invoice to {order.customer.email}. Your dashboard is ready now.</p>
      </div>

      <div className="mt-8 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6">
        <h2 className="text-[17px] font-bold">Complete your wire transfer</h2>
        <dl className="mt-4 divide-y divide-[var(--line)] text-[14px]">
          <div className="flex items-center justify-between py-3"><dt className="text-[var(--muted)]">Amount</dt><dd className="font-bold tabular">{usd(q.total)}<CopyValue value={String(q.total)} /></dd></div>
          <div className="flex items-center justify-between py-3"><dt className="text-[var(--muted)]">Payment reference</dt><dd className="font-mono font-semibold">{order.reference}<CopyValue value={order.reference} /></dd></div>
          {bankRows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-4 py-3"><dt className="text-[var(--muted)]">{k}</dt><dd className="text-right font-medium">{v}<CopyValue value={v} /></dd></div>
          ))}
        </dl>
        {bankRows.length < 2 && <p className="mt-3 text-[12.5px] text-[var(--faint)]">Full bank details are on the invoice we email you.</p>}
        <p className="mt-3 text-[12.5px] text-[var(--faint)]">Always include the reference so we can match your payment. We order your servers as soon as funds arrive.</p>
      </div>

      <div className="mt-4 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6">
        <h2 className="text-[17px] font-bold">What happens next</h2>
        <ol className="mt-4 space-y-3">
          {timeline.map(([step, time], i) => (
            <li key={step} className="flex items-start gap-3 text-[14px]">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-coco-purple/10 text-[11px] font-bold text-coco-violet">{i + 1}</span>
              <span className="flex-1">{step}</span>
              <span className="shrink-0 text-[12px] font-semibold text-coco-violet">{time}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/dashboard" className="rounded-xl bg-coco-purple px-6 py-3.5 text-[15px] font-semibold text-white hover:bg-[#ad1fff]">Open my dashboard</Link>
        <CallbackButton context={order.reference} />
      </div>
    </motion.div>
  );
}

export default function CheckoutPage({ funnel = false }) {
  const [params] = useSearchParams();
  const selection = useMemo(() => selectionFromQuery(params), [params]);
  const country = getCountry(selection.country);
  const [catalog, setCatalog] = useState(null);
  const lead = getRegistration()?.lead;

  const [form, setForm] = useState({
    name: lead?.name ?? '',
    email: lead?.email ?? '',
    phone: lead?.phone ?? '',
    company: '',
    line1: '',
    line2: '',
    city: '',
    region: '',
    postal: '',
    country: lead?.location?.country || '',
  });
  const [method, setMethod] = useState('wire');
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    getCatalog(country.id).then(setCatalog);
  }, [country.id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [order]);

  const model = catalog?.find((m) => m.id === selection.model) ?? null;
  const q = model ? quote(model, selection.pkg, selection.qty) : null;
  const backTo = funnel ? '/live/offer' : '/packages';
  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    if (errors[k]) setErrors({ ...errors, [k]: undefined });
  };

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'Required';
    if (!EMAIL.test(form.email.trim())) next.email = 'Enter a valid email';
    if (form.phone.replace(/\D/g, '').length < 7) next.phone = 'Enter a valid phone number';
    ['line1', 'city', 'postal', 'country'].forEach((k) => {
      if (!form[k].trim()) next[k] = 'Required';
    });
    if (!agree) next.agree = 'Please confirm to continue';
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() => document.querySelector('main [aria-invalid="true"]')?.focus());
      return;
    }

    setBusy(true);
    setNotice('');
    const payload = {
      reference: newReference(),
      method,
      selection,
      model: { id: model.id, name: model.name, supplier: model.supplier, supplierPrice: model.supplierPrice },
      quote: q,
      customer: { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), company: form.company.trim() },
      address: { line1: form.line1, line2: form.line2, city: form.city, region: form.region, postal: form.postal, country: form.country },
      dataCenter: { country: country.name, city: country.city },
    };
    await submitLead('server-order', payload);

    if (method === 'card') {
      if (!ENDPOINTS.checkout) {
        setNotice('Card payments are being connected. Choose wire transfer for now, or request a call back and we will send a secure payment link.');
        setBusy(false);
        return;
      }
      try {
        const res = await fetch(ENDPOINTS.checkout, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (data?.url) {
          window.location.assign(data.url);
          return;
        }
        throw new Error('No checkout URL');
      } catch {
        setNotice('We could not start the card payment. Please try again, choose wire transfer, or request a call back.');
        setBusy(false);
        return;
      }
    }
    setOrder(payload);
    setBusy(false);
  };

  const layout = (children) => (
    <FunnelLayout step={funnel ? 'checkout' : undefined} title="Checkout">
      <section className="mx-auto max-w-[1180px] px-4 pb-24 pt-10 sm:px-6 sm:pt-14">{children}</section>
    </FunnelLayout>
  );

  if (order && q) return layout(<Confirmation order={order} q={q} />);

  if (catalog && !model) {
    return layout(
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-2xl font-bold">That server isn't available</h1>
        <p className="mt-2 text-[var(--muted)]">It may have sold out in {country.name}. Please choose your package again.</p>
        <Link to={backTo} className="mt-6 inline-block rounded-xl bg-coco-purple px-5 py-3 font-semibold text-white">Choose a package</Link>
      </div>,
    );
  }

  return layout(
    <>
      <Link to={`${backTo}`} className="inline-flex items-center gap-1.5 text-[13px] text-[var(--muted)] hover:text-[var(--ink)]">
        <ArrowLeft size={15} /> Change package
      </Link>
      <h1 className="mt-3 text-[32px] font-bold leading-tight tracking-tight sm:text-4xl">Checkout</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8">
        <form onSubmit={submit} noValidate className="order-2 space-y-4 lg:order-1">
          <Section title="Your details" sub="Your servers are registered in this name.">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Full name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
              <Field label="Company (optional)" autoComplete="organization" value={form.company} onChange={set('company')} />
              <Field label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
              <Field label="Phone" type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} error={errors.phone} />
            </div>
          </Section>

          <Section title="Delivery address" sub={`Servers ship directly to the ${country.city} data center. This address goes on your ownership papers and invoices.`}>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field className="sm:col-span-2" label="Address" autoComplete="address-line1" value={form.line1} onChange={set('line1')} error={errors.line1} />
              <Field className="sm:col-span-2" label="Apartment, suite, etc. (optional)" autoComplete="address-line2" value={form.line2} onChange={set('line2')} />
              <Field label="City" autoComplete="address-level2" value={form.city} onChange={set('city')} error={errors.city} />
              <Field label="State / province" autoComplete="address-level1" value={form.region} onChange={set('region')} />
              <Field label="Postal code" autoComplete="postal-code" value={form.postal} onChange={set('postal')} error={errors.postal} />
              <Field label="Country" autoComplete="country-name" value={form.country} onChange={set('country')} error={errors.country} />
            </div>
          </Section>

          <Section title="Payment method">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { id: 'wire', icon: Banknote, title: 'Wire transfer', sub: 'Recommended for orders of this size. No card fees.' },
                { id: 'card', icon: CreditCard, title: 'Card', sub: 'Secure payment via Stripe. Your bank may limit large amounts.' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  aria-pressed={method === m.id}
                  className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${method === m.id ? 'border-coco-purple bg-coco-purple/10' : 'border-[var(--line)] hover:border-coco-purple/40'}`}
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${method === m.id ? 'bg-coco-purple text-white' : 'bg-[var(--surface-2)] text-[var(--muted)]'}`}>
                    <m.icon size={18} />
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold">{m.title}</span>
                    <span className="block text-[12.5px] leading-snug text-[var(--muted)]">{m.sub}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-[12.5px] text-[var(--faint)]">
              <Info size={13} className="mt-0.5 shrink-0" />
              {method === 'wire' ? 'You will get bank details and a payment reference on the next screen and by email.' : 'You will be redirected to Stripe to complete payment securely.'}
            </p>
          </Section>

          <label className="flex items-start gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 text-[13.5px]">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => {
                setAgree(e.target.checked);
                if (errors.agree) setErrors({ ...errors, agree: undefined });
              }} aria-invalid={Boolean(errors.agree)} className="mt-0.5 h-4 w-4 accent-[#9e00ff]" />
            <span className="text-[var(--muted)]">
              I understand that earnings are estimates and not guaranteed, that server hardware depreciates, and that rack space for {RACK_MONTHS} months is paid up front.
              {errors.agree && <span className="mt-1 block text-rose-500">{errors.agree}</span>}
            </span>
          </label>

          {notice && <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-[13.5px] text-amber-600">{notice}</div>}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CallbackButton context="checkout" />
            <button
              type="submit"
              disabled={busy || !q}
              className="flex items-center justify-center gap-2 rounded-xl bg-coco-purple px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_32px_-12px_rgba(158,0,255,0.9)] transition hover:bg-[#ad1fff] disabled:opacity-60"
            >
              <ShieldCheck size={17} />
              {busy ? 'Processing…' : method === 'wire' ? `Place order · ${q ? usd(q.total) : ''}` : `Pay ${q ? usd(q.total) : ''} by card`}
            </button>
          </div>
        </form>

        <aside className="order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start">
          {q ? <Summary model={model} country={country} q={q} /> : <div className="h-72 animate-pulse rounded-3xl border border-[var(--line)] bg-[var(--surface)]" />}
        </aside>
      </div>
    </>,
  );
}
