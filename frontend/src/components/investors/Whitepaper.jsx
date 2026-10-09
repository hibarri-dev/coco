import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Check, Download, FileText, Landmark, Lock, Server } from 'lucide-react';
import { Reveal } from '../ui/motion';
import { Field, PhoneField } from '../funnel/Modal';
import { BROADCAST } from '../../config/funnel';
import { getRegistration } from '../../lib/broadcast';
import { submitLead } from '../../lib/leads';
import { sendEmail } from '../../lib/email';
import { useVisitor } from '../../lib/visitor';
import { useFormTracking } from '../../hooks/useFormTracking';
import { findDial, toInternational } from '../../data/dialCodes';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const STORE_KEY = 'coco-whitepaper';
const FILE_NAME = 'Whitepaper on Compute - Coco by Hibarri.pdf';
const CONSENT_TEXT = 'I agree to receive emails from CoCo by Hibarri with the white paper, investment updates and offers. I can unsubscribe at any time.';

const INSIDE = [
  { icon: BrainCircuit, t: 'Why superintelligence runs on compute' },
  { icon: Server, t: 'How data centers and servers earn' },
  { icon: Landmark, t: 'The $1.1 trillion cloud landlord economy' },
];

function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
  } catch {
    return null;
  }
}

function Cover() {
  return (
    <div className="relative mx-auto w-full max-w-[300px]" style={{ perspective: 1200 }}>
      <motion.div
        initial={{ rotateY: -18, rotateX: 6, y: 20, opacity: 0 }}
        whileInView={{ rotateY: -10, rotateX: 4, y: 0, opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative aspect-[1/1.32] overflow-hidden rounded-2xl text-white shadow-[30px_40px_80px_-30px_rgba(40,8,90,0.7)]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(150deg,#8b4fb3_0%,#6a2bb8_35%,#3f1a9e_70%,#1c0c52_100%)]" />
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#c77dff]/40 blur-3xl" />
        <div className="absolute inset-0 bg-grain opacity-[0.15] mix-blend-overlay" />
        <div className="absolute inset-y-0 left-0 w-3 bg-black/25" />
        <div className="relative flex h-full flex-col p-7 pl-9">
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">CoCo by Hibarri</div>
          <div className="mt-auto">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d9a6ff]">White paper</div>
            <div className="mt-2 text-[30px] font-bold leading-[1.02] tracking-tight">On Compute</div>
            <div className="mt-3 text-[12px] leading-snug text-white/70">Superintelligence, data centers and where investment is going.</div>
          </div>
          <div className="mt-6 grid grid-cols-6 gap-1 opacity-70">
            {Array.from({ length: 18 }, (_, i) => (
              <span key={i} className={`h-1.5 rounded-full ${i % 5 === 0 ? 'bg-[#d9a6ff]' : 'bg-white/25'}`} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Unlocked({ lead }) {
  return (
    <div>
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500/15 text-emerald-500">
        <Check size={20} strokeWidth={3} />
      </span>
      <h3 className="mt-4 text-[22px] font-bold leading-tight">It's yours, {lead.name.split(' ')[0]}!</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-[var(--muted)]">
        We've also emailed a copy to <b className="font-semibold text-[var(--ink)]">{lead.email}</b>.
      </p>
      <a
        href={BROADCAST.whitepaperUrl}
        download={FILE_NAME}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => submitLead('whitepaper-download', { email: lead.email, name: lead.name, page: 'investors' })}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-coco-purple py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_32px_-12px_rgba(158,0,255,0.9)] transition hover:bg-[#ad1fff]"
      >
        <Download size={16} /> Download the white paper
      </a>
      <a href="#packages" className="mt-3 block w-full rounded-xl border border-[var(--line)] py-3 text-center text-[14px] font-semibold transition hover:bg-[var(--surface-2)]">
        Browse server packages
      </a>
    </div>
  );
}

function RequestForm({ onDone }) {
  const visitor = useVisitor();
  const prior = getRegistration()?.lead;
  const [form, setForm] = useState({ name: prior?.name ?? '', email: prior?.email ?? '', phone: '', iso: prior?.phoneCountry ?? '', consent: false });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const isoTouched = useRef(false);
  const tracking = useFormTracking('whitepaper-request');

  useEffect(() => {
    if (!isoTouched.current && findDial(visitor.countryCode)) setForm((f) => (f.iso ? f : { ...f, iso: visitor.countryCode }));
  }, [visitor.countryCode]);

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((er) => (er[key] ? { ...er, [key]: undefined } : er));
  };

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    const typedCode = form.phone.trim().startsWith('+');
    const digits = form.phone.replace(/\D/g, '').length;
    if (!form.name.trim()) next.name = 'Please enter your name';
    if (!EMAIL.test(form.email.trim())) next.email = 'Please enter a valid email address';
    if (!typedCode && !form.iso) next.phone = 'Please choose your country code';
    else if (digits < 6 || digits > 15) next.phone = 'Please enter a valid mobile number';
    if (!form.consent) next.consent = 'Please agree to receive emails so we can send your white paper';
    setErrors(next);
    if (Object.keys(next).length) return;

    tracking.submitted();
    setBusy(true);
    const lead = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: toInternational(form.iso, form.phone),
      phoneCountry: form.iso,
      consent: { email: true, text: CONSENT_TEXT, at: new Date().toISOString() },
      location: { city: visitor.city, region: visitor.region, country: visitor.country, countryCode: visitor.countryCode, ip: visitor.ip, source: visitor.source },
    };
    await submitLead('whitepaper-request', lead);
    sendEmail('whitepaper', { name: lead.name, email: lead.email });
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ name: lead.name, email: lead.email }));
    } catch {
      /* storage unavailable */
    }
    onDone(lead);
  };

  return (
    <form onSubmit={submit} noValidate {...tracking.handlers}>
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-coco-purple/10 text-coco-violet">
        <FileText size={20} />
      </span>
      <h3 className="mt-4 text-[22px] font-bold leading-tight">Get the free white paper</h3>
      <p className="mt-1.5 text-[14px] text-[var(--muted)]">Instant download, plus a copy in your inbox.</p>
      <div className="mt-5 space-y-3.5">
        <Field label="Full name" autoComplete="name" value={form.name} onChange={(e) => update('name', e.target.value)} error={errors.name} />
        <Field label="Email" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={(e) => update('email', e.target.value)} error={errors.email} />
        <PhoneField
          iso={form.iso}
          onIso={(iso) => {
            isoTouched.current = true;
            update('iso', iso);
            setErrors((er) => ({ ...er, phone: undefined }));
          }}
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
          error={errors.phone}
        />
      </div>
      <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[13px] leading-snug text-[var(--muted)]">
        <input
          type="checkbox"
          data-track="Email consent"
          checked={form.consent}
          onChange={(e) => update('consent', e.target.checked)}
          aria-invalid={Boolean(errors.consent)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#9e00ff]"
        />
        <span>{CONSENT_TEXT}</span>
      </label>
      {errors.consent && <span className="mt-1 block pl-6 text-[12px] text-rose-500">{errors.consent}</span>}
      <button type="submit" disabled={busy} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-coco-purple py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#ad1fff] disabled:opacity-60">
        <Download size={16} /> {busy ? 'Preparing your copy…' : 'Get the white paper'}
      </button>
      <p className="mt-3 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-[var(--faint)]">
        <Lock size={12} className="mt-0.5 shrink-0" />
        We never share your details. Unsubscribe from any email in one click.
      </p>
    </form>
  );
}

export default function Whitepaper() {
  const [lead, setLead] = useState(readSaved);
  return (
    <section id="whitepaper" className="mx-auto max-w-[1180px] scroll-mt-20 px-4 pb-28 sm:px-6 sm:pb-36">
      <div className="relative overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--surface)]">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-coco-purple/10 blur-[100px]" />
        <div className="relative grid items-center gap-10 p-6 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14 lg:p-14">
          <Reveal>
            <div className="text-[13px] font-semibold text-coco-violet">Free white paper</div>
            <h2 className="mt-3 text-3xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
              White Paper <span className="text-purple-glow">on Compute</span>
            </h2>
            <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-[var(--muted)]">
              A free read on compute, superintelligence and where investment is going, written for investors rather than engineers.
            </p>
            <div className="mt-8 grid items-center gap-8 sm:grid-cols-[200px_1fr]">
              <div className="hidden sm:block">
                <Cover />
              </div>
              <ul className="space-y-3">
                {INSIDE.map(({ icon: Icon, t }) => (
                  <li key={t} className="flex items-center gap-3 text-[15px] font-medium">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-coco-purple/10 text-coco-violet">
                      <Icon size={17} />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--page)] p-6 shadow-[0_30px_80px_-40px_rgba(40,8,90,0.45)] sm:p-7">
              {lead ? <Unlocked lead={lead} /> : <RequestForm onDone={setLead} />}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
