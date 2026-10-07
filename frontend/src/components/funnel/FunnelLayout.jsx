import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Logo } from '../Logo';
import ThemeToggle from '../ui/ThemeToggle';
import { useTheme } from '../../hooks/useTheme';

const STEPS = [
  { key: 'join', label: 'Join', to: '/live' },
  { key: 'broadcast', label: 'Broadcast', to: '/live/room' },
  { key: 'offer', label: 'Offer', to: '/live/offer' },
  { key: 'checkout', label: 'Checkout', to: null },
];

function Steps({ current }) {
  const index = STEPS.findIndex((s) => s.key === current);
  return (
    <ol className="flex items-center gap-1 sm:gap-2" aria-label="Progress">
      {STEPS.map((s, i) => {
        const done = i < index;
        const active = i === index;
        const content = (
          <>
            <span
              className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                done ? 'bg-coco-purple text-white' : active ? 'bg-white text-black' : 'bg-white/10 text-white/50'
              }`}
            >
              {done ? <Check size={11} strokeWidth={3} /> : i + 1}
            </span>
            <span className={`hidden text-[12.5px] font-medium sm:inline ${active ? 'text-white' : 'text-white/50'}`}>{s.label}</span>
          </>
        );
        return (
          <li key={s.key} className="flex items-center gap-1 sm:gap-2" aria-current={active ? 'step' : undefined}>
            {i > 0 && <span className={`h-px w-3 sm:w-6 ${done || active ? 'bg-coco-violet' : 'bg-white/15'}`} />}
            {done && s.to ? (
              <Link to={s.to} className="flex items-center gap-1.5 rounded-full px-1 py-0.5 hover:bg-white/5">
                {content}
              </Link>
            ) : (
              <span className="flex items-center gap-1.5 px-1 py-0.5">{content}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function FunnelLayout({ step, title, children }) {
  const { theme } = useTheme();

  useEffect(() => {
    if (title) document.title = `${title} · CoCo by Hibarri`;
  }, [title]);

  return (
    <div data-theme={theme} className="inv-theme min-h-screen bg-[var(--page)] text-[var(--ink)] transition-colors duration-500">
      <header data-theme={theme} className="site-theme sticky top-0 z-50 border-b border-white/[0.06] bg-[#0b0a10]/85 text-white backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" aria-label="CoCo home" className="shrink-0">
            <Logo tagline={false} className="h-[18px] w-auto sm:h-[20px]" />
          </Link>
          {step && <Steps current={step} />}
          <ThemeToggle />
        </div>
      </header>

      <main>{children}</main>

      <footer className="mx-auto max-w-[1180px] px-6 py-12 text-[12px] leading-relaxed text-[var(--faint)]">
        <div className="flex flex-col gap-4 border-t border-[var(--line)] pt-8 sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-2xl">
            Earnings shown are estimates for servers that have reached network maturity and are not guaranteed. Server hardware depreciates over
            roughly seven years and returns depend on market demand. This page is for information only and is not financial advice.
          </p>
          <div className="flex shrink-0 gap-5">
            <a href="mailto:partners@hibarri.com" className="hover:text-[var(--ink)]">Contact</a>
            <span>© {new Date().getFullYear()} Hibarri</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
