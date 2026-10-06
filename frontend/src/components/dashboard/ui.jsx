import { motion } from 'framer-motion';
import { EASE } from '../ui/motion';

export function Card({ className = '', children, ...rest }) {
  return (
    <div className={`rounded-2xl border border-white/[0.07] bg-[#0e0d13] ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ title, sub, action, icon: Icon }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 pt-5">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.05] text-white/70">
            <Icon size={15} />
          </span>
        )}
        <div>
          <h3 className="text-[15px] font-semibold">{title}</h3>
          {sub && <p className="text-[12.5px] text-white/45">{sub}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, sub, actions }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 text-[14px] text-white/50">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, sub, icon: Icon, trend, accent, children, className = '' }) {
  return (
    <Card className={`relative overflow-hidden p-5 ${className}`}>
      {accent && <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-coco-purple/20 blur-2xl" />}
      <div className="relative flex items-center justify-between">
        <span className="text-[12.5px] font-medium text-white/50">{label}</span>
        {Icon && <Icon size={16} className="text-white/30" />}
      </div>
      <div className="relative mt-3 flex items-baseline gap-2">
        <span className="text-[26px] font-bold tracking-tight tabular">{value}</span>
        {trend !== undefined && (
          <span className={`text-[12px] font-semibold ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      {sub && <div className="relative mt-1 text-[12.5px] text-white/40">{sub}</div>}
      {children}
    </Card>
  );
}

const BADGE = {
  Online: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20',
  Active: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20',
  Succeeded: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20',
  Paid: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20',
  Maintenance: 'bg-amber-400/10 text-amber-300 ring-amber-400/20',
  Pending: 'bg-amber-400/10 text-amber-300 ring-amber-400/20',
  Due: 'bg-amber-400/10 text-amber-300 ring-amber-400/20',
  Migrating: 'bg-amber-400/10 text-amber-300 ring-amber-400/20',
  Provisioning: 'bg-sky-400/10 text-sky-300 ring-sky-400/20',
  Trial: 'bg-sky-400/10 text-sky-300 ring-sky-400/20',
  Scheduled: 'bg-coco-purple/15 text-coco-lilac ring-coco-purple/30',
  Failed: 'bg-rose-400/10 text-rose-300 ring-rose-400/20',
  Refunded: 'bg-white/[0.06] text-white/60 ring-white/10',
};

export function Badge({ children, pulse }) {
  const cls = BADGE[children] ?? 'bg-white/[0.06] text-white/70 ring-white/10';
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-medium ring-1 ring-inset ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full bg-current ${pulse ? 'animate-pulse' : ''}`} />
      {children}
    </span>
  );
}

export function Meter({ value, className = '', tone }) {
  const color = tone ?? (value >= 90 ? 'from-amber-400 to-amber-300' : 'from-coco-purple to-coco-violet');
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-white/[0.07] ${className}`}>
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 0.9, ease: EASE }}
      />
    </div>
  );
}

export function Table({ head, children, className = '' }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full min-w-[640px] text-left text-[13.5px]">
        <thead>
          <tr className="border-b border-white/[0.06] text-[11.5px] uppercase tracking-wider text-white/40">
            {head.map((h, i) => (
              <th key={h || i} className={`px-5 py-3 font-medium ${typeof h === 'string' && h.startsWith('>') ? 'text-right' : ''}`}>
                {typeof h === 'string' ? h.replace(/^>/, '') : h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.05]">{children}</tbody>
      </table>
    </div>
  );
}

export function Button({ children, variant = 'primary', className = '', ...rest }) {
  const styles = {
    primary: 'bg-coco-purple text-white hover:bg-[#ad1fff] shadow-[0_8px_24px_-10px_rgba(158,0,255,0.9)]',
    ghost: 'border border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.07] hover:text-white',
    white: 'bg-white text-black hover:bg-white/90',
  };
  return (
    <button className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold transition ${styles[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function Segmented({ options, value, onChange, id }) {
  return (
    <div className="flex rounded-xl border border-white/[0.07] bg-white/[0.02] p-1 text-[12.5px] font-medium">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} className={`relative rounded-lg px-3 py-1.5 transition-colors ${value === o ? 'text-white' : 'text-white/45 hover:text-white/80'}`}>
          {value === o && <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-lg bg-white/[0.08]" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
          <span className="relative">{o}</span>
        </button>
      ))}
    </div>
  );
}

export const page = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.4, ease: EASE },
};
