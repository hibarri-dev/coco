import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Building2, Phone, ArrowRight, Sparkles, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuth, dashboardPathFor } from '../context/AuthContext';
import { getRegistration } from '../lib/broadcast';
import { safeNext } from '../lib/api';
import { getPlan } from '../data/devPlans';

const MIN_PASSWORD = 8;
const inputClass =
  'w-full rounded-xl border border-white/[0.09] bg-white/[0.03] py-2.5 pl-10 pr-3.5 text-[14px] text-white placeholder:text-white/30 focus:border-coco-lilac focus:outline-none';

function InputField({ label, icon: Icon, ...props }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-white/70">
        {label}
        <div className="relative mt-1 flex items-center">
          <Icon size={16} className="absolute left-3.5 text-white/40" />
          <input {...props} className={inputClass} />
        </div>
      </label>
    </div>
  );
}

export default function AuthPage({ defaultRole = 'investor', defaultMode = 'login' }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const buying = /^\/(live\/)?checkout/.test(next);
  const plan = getPlan(params.get('plan'))?.id;
  const lead = getRegistration()?.lead;
  const destination = (u) => {
    if (plan && u?.role === 'user') return `/dev/billing?subscribe=${plan}`;
    return params.get('next') ? next : dashboardPathFor(u);
  };

  const [mode, setMode] = useState(buying && !params.get('mode') ? 'register' : params.get('mode') === 'register' ? 'register' : defaultMode);
  const [role, setRole] = useState(buying ? 'investor' : plan ? 'user' : defaultRole);
  const [form, setForm] = useState({
    name: lead?.name ?? '',
    email: lead?.email ?? '',
    phone: lead?.phone ?? '',
    company: '',
    password: '',
    marketingConsent: false,
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const { user, loading, login, register } = useAuth();
  const isInvestor = role === 'investor';
  // /login and /register are the developer pages; partners and checkout buyers keep the role switch.
  const developer = defaultRole === 'user' && !buying;
  const planName = getPlan(plan)?.name;

  useEffect(() => {
    document.title = `${mode === 'login' ? 'Sign in' : 'Create account'} · CoCo by Hibarri`;
  }, [mode]);

  if (!loading && user) return <Navigate to={destination(user)} replace />;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const switchMode = (m) => {
    setError('');
    setMode(m);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'register' && form.password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }
    setBusy(true);
    try {
      const signedIn =
        mode === 'login'
          ? await login(form.email, form.password)
          : await register({
              name: form.name,
              email: form.email,
              password: form.password,
              phone: form.phone,
              company: form.company,
              role: developer ? 'user' : role,
              marketingConsent: form.marketingConsent,
            });
      navigate(destination(signedIn), { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#09080e] px-4 py-12 text-white selection:bg-coco-purple selection:text-white">
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[500px] w-[500px] rounded-full bg-coco-purple/20 blur-[140px]" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-[500px] w-[500px] rounded-full bg-coco-violet/15 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.14] mix-blend-overlay" />

      <Link
        to={buying ? (next.startsWith('/live') ? '/live/offer' : '/packages') : isInvestor ? '/investors' : '/'}
        className="absolute left-6 top-6 flex items-center gap-2 rounded-xl bg-white/[0.04] px-4 py-2 text-[13px] font-medium text-white/70 backdrop-blur transition hover:bg-white/[0.08] hover:text-white"
      >
        <ArrowLeft size={15} /> {buying ? 'Back to packages' : `Back to ${isInvestor ? 'Cloud Partners' : 'Home'}`}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-[460px] overflow-hidden rounded-[28px] border border-white/[0.1] bg-[#12101a]/80 p-8 shadow-[0_30px_100px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
      >
        <div className="mb-6 flex justify-center">
          <Link to="/" aria-label="CoCo home">
            <Logo tagline={false} className="h-6 w-auto" />
          </Link>
        </div>

        {mode === 'register' && !developer && (
          <div className="mb-6 flex rounded-2xl border border-white/[0.08] bg-black/40 p-1 text-[13px] font-medium">
            <button
              type="button"
              onClick={() => setRole('investor')}
              aria-pressed={isInvestor}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 transition ${
                isInvestor ? 'bg-coco-purple text-white shadow-md' : 'text-white/60 hover:text-white'
              }`}
            >
              <Sparkles size={13} /> Cloud Partner
            </button>
            <button
              type="button"
              onClick={() => setRole('user')}
              aria-pressed={!isInvestor}
              className={`flex-1 rounded-xl py-2 transition ${!isInvestor ? 'bg-white/15 text-white shadow-md' : 'text-white/60 hover:text-white'}`}
            >
              Developer / User
            </button>
          </div>
        )}

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            {developer
              ? mode === 'login'
                ? 'Sign in to CoCo Cloud'
                : 'Create your developer account'
              : mode === 'login'
                ? 'Sign in'
                : isInvestor
                  ? 'Join as Cloud Partner'
                  : 'Create Account'}
          </h1>
          <p className="mt-1 text-[13.5px] text-white/60">
            {buying
              ? 'Your servers and orders are saved to your account, so you can track them in your dashboard.'
              : developer
                ? planName
                  ? `You picked the ${planName} plan. ${mode === 'login' ? 'Sign in' : 'Create your account'} and we'll take you to checkout.`
                  : 'Deploy apps, databases and workers. Plans from $5/month.'
                : isInvestor
                  ? 'Track your server inventory, data center locations, and compute earnings.'
                  : 'Deploy workloads, manage infrastructure, and scale your compute.'}
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-[13px] text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <InputField label="Full name" icon={User} type="text" required autoComplete="name" value={form.name} onChange={set('name')} placeholder="e.g. Elena Rostova" />
              {developer ? (
                <InputField label="Company (optional)" icon={Building2} type="text" autoComplete="organization" value={form.company} onChange={set('company')} placeholder="e.g. Brightloop" />
              ) : (
                <InputField label="Phone" icon={Phone} type="tel" required autoComplete="tel" value={form.phone} onChange={set('phone')} placeholder="+1 555 010 0100" />
              )}
              {isInvestor && !developer && (
                <InputField label="Company / entity (optional)" icon={Building2} type="text" autoComplete="organization" value={form.company} onChange={set('company')} placeholder="e.g. Apex Holdings LLC" />
              )}
            </>
          )}

          <InputField label="Email address" icon={Mail} type="email" required autoComplete="email" value={form.email} onChange={set('email')} placeholder="name@company.com" />
          <InputField
            label="Password"
            icon={Lock}
            type="password"
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength={mode === 'register' ? MIN_PASSWORD : undefined}
            value={form.password}
            onChange={set('password')}
            placeholder={mode === 'register' ? `At least ${MIN_PASSWORD} characters` : '••••••••'}
          />

          {mode === 'register' && (
            <label className="flex cursor-pointer items-start gap-2.5 text-[12.5px] leading-snug text-white/60">
              <input
                type="checkbox"
                data-track="Marketing consent"
                checked={form.marketingConsent}
                onChange={(e) => setForm({ ...form, marketingConsent: e.target.checked })}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#9e00ff]"
              />
              <span>Send me news, offers and updates from CoCo by Hibarri. I can unsubscribe at any time.</span>
            </label>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-coco-purple py-3 text-[14.5px] font-semibold text-white shadow-lg transition hover:bg-[#a123f3] disabled:opacity-50"
          >
            {busy ? (
              'Please wait…'
            ) : mode === 'login' ? (
              <>
                Sign in <ArrowRight size={16} />
              </>
            ) : (
              <>
                Create account <ShieldCheck size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-white/[0.06] pt-4 text-center text-[13px] text-white/50">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account yet?{' '}
              <button type="button" onClick={() => switchMode('register')} className="font-medium text-coco-lilac hover:underline">
                Register now
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" onClick={() => switchMode('login')} className="font-medium text-coco-lilac hover:underline">
                Sign in
              </button>
            </>
          )}
          {!buying && (
            <div className="mt-3 text-[12.5px] text-white/40">
              {developer ? (
                <>
                  Cloud Partner?{' '}
                  <Link to="/investors/login" className="font-medium text-white/70 hover:text-white hover:underline">Partner sign in</Link>
                </>
              ) : (
                <>
                  Developer?{' '}
                  <Link to="/login" className="font-medium text-white/70 hover:text-white hover:underline">Developer sign in</Link>
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
