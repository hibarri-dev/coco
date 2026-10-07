import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowDownRight, BrainCircuit, ChevronDown, Download, FileText, Play, Server, Sparkles, Landmark, Lock } from 'lucide-react';
import FunnelLayout from '../../components/funnel/FunnelLayout';
import Countdown from '../../components/funnel/Countdown';
import { Modal, Field } from '../../components/funnel/Modal';
import { Reveal, EASE } from '../../components/ui/motion';
import { BROADCAST } from '../../config/funnel';
import { dayLabel, formatClock, getRegistration, getSchedule, saveRegistration, timeZoneLabel, useNow } from '../../lib/broadcast';
import { useVisitor } from '../../lib/visitor';
import { submitLead } from '../../lib/leads';
import { DIAL_CODES, findDial, toInternational } from '../../data/dialCodes';

const rise = (delay) => ({
  initial: { opacity: 0, y: 22, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.9, delay, ease: EASE },
});

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function SeatButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-3 rounded-xl bg-white py-1.5 pl-5 pr-1.5 text-[15px] font-semibold text-black shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] ${className}`}
    >
      Secure My Free Seat
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#c9a8ff] transition group-hover:bg-coco-purple group-hover:text-white">
        <ArrowDownRight size={17} />
      </span>
    </button>
  );
}

const CONSENT_TEXT = 'I agree to receive emails from CoCo by Hibarri about this event, investment updates and offers. I can unsubscribe at any time.';

function PhoneField({ iso, onIso, value, onChange, error }) {
  const current = findDial(iso);
  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-medium">Mobile number</span>
      <div
        className={`flex rounded-xl border bg-[var(--surface-2)] transition focus-within:border-coco-purple focus-within:ring-2 focus-within:ring-coco-purple/20 ${
          error ? 'border-rose-400' : 'border-[var(--line)]'
        }`}
      >
        <label className="relative flex shrink-0 items-center gap-1 border-r border-[var(--line)] pl-3.5 pr-2.5 text-[15px]">
          <span className={current ? 'font-medium' : 'text-[var(--faint)]'}>{current ? `${current.iso} +${current.dial}` : 'Code'}</span>
          <ChevronDown size={14} className="text-[var(--faint)]" />
          <select aria-label="Country code" value={iso} onChange={(e) => onIso(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0">
            {!current && <option value="">Select your country</option>}
            {DIAL_CODES.map((c) => (
              <option key={c.iso} value={c.iso}>
                {c.name} (+{c.dial})
              </option>
            ))}
          </select>
        </label>
        <input
          type="tel"
          autoComplete="tel-national"
          inputMode="tel"
          aria-label="Mobile number"
          aria-invalid={Boolean(error)}
          value={value}
          onChange={onChange}
          className="min-w-0 flex-1 bg-transparent px-3.5 py-3 text-[15px] outline-none placeholder:text-[var(--faint)]"
        />
      </div>
      {error && <span className="mt-1 block text-[12px] text-rose-500">{error}</span>}
    </div>
  );
}

function RegisterForm({ visitor, onDone }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', iso: '', consent: false });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const isoTouched = useRef(false);

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
    if (!form.consent) next.consent = 'Please agree to receive emails so we can send your seat link';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    let deviceTimezone = '';
    try {
      deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      /* ignore */
    }
    const lead = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: toInternational(form.iso, form.phone),
      phoneCountry: form.iso,
      consent: { email: true, text: CONSENT_TEXT, at: new Date().toISOString() },
      location: {
        city: visitor.city,
        region: visitor.region,
        country: visitor.country,
        countryCode: visitor.countryCode,
        ipTimezone: visitor.timezone,
        deviceTimezone,
        ip: visitor.ip,
        source: visitor.source,
      },
    };
    await submitLead('broadcast-registration', lead);
    saveRegistration(lead);
    onDone(lead);
  };

  return (
    <form onSubmit={submit} noValidate>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-coco-purple/10 px-2.5 py-1 text-[11.5px] font-semibold text-coco-violet">
        <Sparkles size={12} /> Free seat
      </span>
      <h3 className="mt-3 pr-8 text-[22px] font-bold leading-tight">Reserve your seat for {BROADCAST.title}</h3>
      <p className="mt-1.5 text-[14px] text-[var(--muted)]">We'll send your seat link and a reminder before the broadcast starts.</p>
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
          checked={form.consent}
          onChange={(e) => update('consent', e.target.checked)}
          aria-invalid={Boolean(errors.consent)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#9e00ff]"
        />
        <span>{CONSENT_TEXT}</span>
      </label>
      {errors.consent && <span className="mt-1 block pl-6 text-[12px] text-rose-500">{errors.consent}</span>}
      <button type="submit" disabled={busy} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-coco-purple py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#ad1fff] disabled:opacity-60">
        <Play size={16} fill="currentColor" /> {busy ? 'Reserving your seat…' : 'Watch the broadcast'}
      </button>
      <p className="mt-3 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-[var(--faint)]">
        <Lock size={12} className="mt-0.5 shrink-0" />
        We use your IP address to show your local start time and to understand where our audience joins from.
      </p>
    </form>
  );
}

function startsIn(ms) {
  const totalMinutes = Math.max(1, Math.ceil(ms / 60000));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const part = (n, unit) => `${n} ${unit}${n === 1 ? '' : 's'}`;
  if (!h) return part(m, 'minute');
  return m ? `${part(h, 'hour')} ${part(m, 'minute')}` : part(h, 'hour');
}

function WhitePaper({ lead, msUntil, onContinue }) {
  const url = BROADCAST.whitepaperUrl;
  return (
    <div>
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-coco-purple/10 text-coco-violet">
        <FileText size={20} />
      </span>
      <h3 className="mt-4 pr-8 text-[22px] font-bold leading-tight">You're in, {lead.name.split(' ')[0]}!</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-[var(--muted)]">
        This event starts in <b className="font-semibold text-[var(--ink)]">{startsIn(msUntil)}</b>. In the meantime, here's a free white paper to read on compute,
        superintelligence and where investment is going!
      </p>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => submitLead('whitepaper-download', { email: lead.email, name: lead.name })}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-coco-purple py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#ad1fff]"
        >
          <Download size={16} /> Read the free white paper
        </a>
      ) : (
        <p className="mt-6 rounded-xl bg-[var(--surface-2)] px-4 py-3 text-[13.5px] text-[var(--muted)]">
          We'll email the white paper to <b className="font-semibold text-[var(--ink)]">{lead.email}</b>.
          {import.meta.env.DEV && ' (Set VITE_WHITEPAPER_URL to show a download button.)'}
        </p>
      )}
      <button
        type="button"
        onClick={onContinue}
        className="mt-3 w-full rounded-xl border border-[var(--line)] py-3 text-[14px] font-semibold transition hover:bg-[var(--surface-2)]"
      >
        Go to the broadcast room
      </button>
    </div>
  );
}

const LEARN = [
  { icon: BrainCircuit, t: 'Why superintelligence needs compute', d: 'How AI demand is turning raw processing power into one of the most valuable resources on earth.' },
  { icon: Server, t: 'Data centers and servers, explained', d: 'What a server actually is, where it lives, and how it earns from developers renting its capacity.' },
  { icon: Landmark, t: 'Your share of the cloud landlord economy', d: 'How owning servers compares with owning property, and how to get started from 5 servers.' },
];

export default function JoinPage() {
  const navigate = useNavigate();
  const visitor = useVisitor();
  const now = useNow(1000);
  const schedule = getSchedule(now);
  const [open, setOpen] = useState(false);
  const [lead, setLead] = useState(null);
  const registered = Boolean(getRegistration()?.lead);
  const day = dayLabel(schedule.start, now);
  const time = `${formatClock(schedule.start)} ${timeZoneLabel(schedule.start)}`;
  const when = visitor.city ? `In ${visitor.city}, ${day.toLowerCase()} at ${time}` : `${day} at ${time}`;

  const cta = () => (registered ? navigate('/live/room') : setOpen(true));

  return (
    <FunnelLayout step="join" title={BROADCAST.title}>
      <section className="px-3 pt-3">
        <div className="relative overflow-hidden rounded-[28px]">
          <div className="absolute inset-0 animate-gradient bg-[linear-gradient(115deg,#8b4fb3_0%,#6a2bb8_30%,#3f1a9e_60%,#1c0c52_100%)] bg-[length:180%_180%]" />
          <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-[#c77dff]/30 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[500px] w-[700px] rounded-full bg-[#2a0a7a]/60 blur-[120px]" />
          <div className="absolute inset-0 bg-grain opacity-[0.18] mix-blend-overlay" />

          <div className="relative mx-auto grid max-w-[1180px] items-center gap-8 px-5 pb-10 pt-10 text-white sm:gap-12 sm:px-8 sm:pb-20 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <div className="text-center lg:text-left">
              <motion.div {...rise(0)} className="inline-flex items-center gap-2 rounded-full bg-black/35 px-3.5 py-1.5 text-[12px] text-white/85 backdrop-blur sm:px-4 sm:text-[13px]">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inset-0 animate-pulse-ring rounded-full bg-[#d9a6ff]" />
                  <span className="relative h-2 w-2 rounded-full bg-[#d9a6ff]" />
                </span>
                <span>
                  <b className="font-semibold text-white">Live Event</b> · {when}
                </span>
              </motion.div>
              <motion.h1 {...rise(0.08)} className="mt-5 text-[36px] font-bold leading-[1] tracking-[-0.03em] sm:mt-6 sm:text-6xl lg:text-[72px]">
                Real Estate vs <span className="bg-gradient-to-r from-white via-[#ead6ff] to-[#c9a8ff] bg-clip-text text-transparent">Digital Estate</span>
              </motion.h1>
              <motion.p {...rise(0.16)} className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/80 sm:mt-6 sm:text-lg lg:mx-0">
                Learn about superintelligence, compute, data centers, servers, and how to get your share of the $1.1 trillion cloud landlord economy.
              </motion.p>
              <motion.div {...rise(0.24)} className="mt-8 hidden lg:flex">
                <SeatButton onClick={cta} />
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 40, rotateX: 10 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 1.1, delay: 0.3, ease: EASE }} style={{ transformPerspective: 1400 }}>
              <button type="button" onClick={cta} className="group relative block aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-black/40 text-left shadow-[0_40px_120px_-30px_rgba(0,0,0,0.7)]">
                {BROADCAST.previewUrl ? (
                  <video src={BROADCAST.previewUrl} poster={BROADCAST.posterUrl || undefined} autoPlay muted loop playsInline className="h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(90%_90%_at_30%_20%,rgba(201,168,255,0.35),transparent_60%),linear-gradient(160deg,#1b0d3a,#0b0614)]">
                    <div className="absolute inset-0 bg-dot-grid opacity-40" />
                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">Preview</div>
                      <div className="mt-1 text-xl font-bold sm:text-2xl">{BROADCAST.title}</div>
                    </div>
                  </div>
                )}
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-white text-black shadow-2xl transition-transform group-hover:scale-110 sm:h-20 sm:w-20">
                    <Play size={28} fill="currentColor" className="ml-1" />
                  </span>
                </span>
                <span className="absolute left-3 top-3 rounded-md bg-black/55 px-2 py-1 text-[11px] font-medium backdrop-blur">Watch preview</span>
              </button>

              <div className="mt-6 rounded-2xl bg-black/25 p-4 text-center backdrop-blur sm:p-5">
                {schedule.status === 'live' ? (
                  <>
                    <div className="text-[13px] font-medium text-white/80">The live event started {Math.max(1, Math.floor(schedule.position / 60))} minutes ago</div>
                    <button onClick={cta} className="mt-3 rounded-xl bg-white px-5 py-2.5 text-[14px] font-semibold text-black">Join now</button>
                  </>
                ) : (
                  <>
                    <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">Live event starts in</div>
                    <Countdown ms={schedule.msUntil} />
                  </>
                )}
              </div>
              {schedule.status !== 'live' && (
                <div className="mt-6 flex justify-center lg:hidden">
                  <SeatButton onClick={cta} />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-6 py-20 sm:py-28">
        <Reveal className="text-center">
          <div className="text-[13px] font-semibold text-coco-violet">What you'll learn</div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">From property to processing power</h2>
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {LEARN.map(({ icon: Icon, t, d }, i) => (
            <Reveal key={t} delay={i * 0.08}>
              <div className="h-full rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-7">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-coco-purple/10 text-coco-violet">
                  <Icon size={20} />
                </span>
                <h3 className="mt-5 text-lg font-bold">{t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--muted)]">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <button onClick={cta} className="inline-flex items-center gap-2 rounded-xl bg-coco-purple px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_32px_-12px_rgba(158,0,255,0.9)] hover:bg-[#ad1fff]">
            Secure My Free Seat <ArrowDownRight size={17} />
          </button>
        </div>
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title={lead ? 'Your free white paper' : 'Reserve your seat'}>
        {lead ? (
          <WhitePaper lead={lead} msUntil={schedule.msUntil ?? 0} onContinue={() => navigate('/live/room')} />
        ) : (
          <RegisterForm
            visitor={visitor}
            onDone={(l) => (getSchedule().status === 'live' ? navigate('/live/room') : setLead(l))}
          />
        )}
      </Modal>
    </FunnelLayout>
  );
}
