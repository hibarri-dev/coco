import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock, Minus, Plus, X, Cpu, MemoryStick, HardDrive, Microchip, MapPin, Info } from 'lucide-react';
import { getCheckoutUrl } from '../config/stripe';
import { usd } from '../data/packages';
import { EASE } from './ui/motion';

export default function CheckoutModal({ pkg, quantity = 1, onClose }) {
  return (
    <AnimatePresence>
      {pkg && <CheckoutDialog key={pkg.id} pkg={pkg} initialQty={quantity} onClose={onClose} />}
    </AnimatePresence>
  );
}

function CheckoutDialog({ pkg, initialQty, onClose }) {
  const [qty, setQty] = useState(() => Math.min(Math.max(initialQty, 1), pkg.stock));
  const [location, setLocation] = useState('Best available');
  const [email, setEmail] = useState('');
  const [notConfigured, setNotConfigured] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const total = pkg.price * qty;

  const checkout = () => {
    const reference = `${pkg.id}__${qty}__${location.replace(/\s+/g, '-').toLowerCase()}`;
    const url = getCheckoutUrl(pkg.id, { quantity: qty, email: email || undefined, reference });
    if (url) window.location.assign(url);
    else setNotConfigured(true);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-default" />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.98 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="relative w-full sm:max-w-[520px] max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#0e0d14] text-white shadow-[0_40px_120px_-20px_rgba(158,0,255,0.35)]"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-coco-violet/70 to-transparent" />
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-coco-violet font-semibold">Reserve server</div>
              <h3 id="checkout-title" className="mt-1.5 text-2xl font-bold tracking-tight">{pkg.name}</h3>
              <p className="text-sm text-white/55 mt-1">{pkg.tagline}</p>
            </div>
            <button onClick={onClose} className="rounded-full p-2 text-white/50 hover:text-white hover:bg-white/10 transition" aria-label="Close dialog">
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 text-[13px]">
            <Spec icon={Cpu} label={`${pkg.cores} cores · ${pkg.vcpu} vCPU`} />
            <Spec icon={MemoryStick} label={pkg.ram} />
            <Spec icon={HardDrive} label={pkg.storage} />
            <Spec icon={Microchip} label={pkg.gpu ?? `${pkg.network} uplink`} />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Quantity</div>
              <div className="text-xs text-white/45">{pkg.stock} available right now</div>
            </div>
            <div className="flex items-center rounded-full border border-white/10 bg-white/[0.03]">
              <button className="p-2.5 text-white/70 hover:text-white disabled:opacity-30" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity">
                <Minus size={15} />
              </button>
              <span className="w-8 text-center font-semibold tabular">{qty}</span>
              <button className="p-2.5 text-white/70 hover:text-white disabled:opacity-30" onClick={() => setQty((q) => Math.min(pkg.stock, q + 1))} disabled={qty >= pkg.stock} aria-label="Increase quantity">
                <Plus size={15} />
              </button>
            </div>
          </div>

          <div className="mt-5">
            <div className="text-sm font-medium mb-2 flex items-center gap-1.5"><MapPin size={14} className="text-white/50" /> Data center</div>
            <div className="flex flex-wrap gap-2">
              {['Best available', ...pkg.locations].map((loc) => (
                <button
                  key={loc}
                  onClick={() => setLocation(loc)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition ${
                    location === loc ? 'border-coco-purple bg-coco-purple/15 text-white' : 'border-white/10 text-white/60 hover:text-white hover:border-white/25'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-medium">Email for receipts</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-coco-violet/60 focus:bg-white/[0.05] transition"
            />
          </label>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm space-y-2.5">
            <Row label={`Hardware · ${qty} × ${usd(pkg.price)}`} value={usd(total)} />
            <Row label="Sourcing, racking & burn-in" value="Included" accent />
            <Row label="Estimated go-live" value={pkg.leadTime} />
            <div className="h-px bg-white/10 my-1" />
            <Row label={<span className="font-semibold text-white">Due today</span>} value={<span className="text-lg font-bold">{usd(total)}</span>} />
            <Row
              label="Projected monthly revenue"
              value={<span className="text-coco-lilac font-semibold">{usd(pkg.revenueLow * qty)} – {usd(pkg.revenueHigh * qty)}</span>}
            />
          </div>

          <AnimatePresence>
            {notConfigured && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 flex gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3.5 text-[13px] text-amber-100/90">
                  <Info size={16} className="mt-0.5 shrink-0 text-amber-300" />
                  <p>
                    Stripe checkout isn't connected in this environment yet. Set{' '}
                    <code className="font-mono text-amber-200">VITE_STRIPE_LINK_{pkg.id.replace(/-/g, '_').toUpperCase()}</code> to a Stripe Payment Link to go live.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={checkout}
            className="group mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-coco-purple px-5 py-3.5 font-semibold text-white shadow-[0_10px_40px_-10px_rgba(158,0,255,0.8)] hover:bg-[#ad1fff] transition"
          >
            <Lock size={16} /> Continue to secure checkout
          </button>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-white/40">
            Payments are processed by Stripe. Revenue projections are based on current network utilisation and are not guaranteed.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Spec({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-white/75">
      <Icon size={14} className="text-coco-violet shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
}

function Row({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-white/55">{label}</span>
      <span className={accent ? 'text-emerald-300 font-medium' : 'font-medium text-white/90'}>{value}</span>
    </div>
  );
}
