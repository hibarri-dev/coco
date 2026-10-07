import { splitDuration } from '../../lib/broadcast';

const pad = (n) => String(n).padStart(2, '0');

export default function Countdown({ ms, size = 'lg', tone = 'light' }) {
  const { hours, minutes, seconds } = splitDuration(ms);
  const big = size === 'lg';
  const box =
    tone === 'light'
      ? 'bg-white/15 text-white ring-1 ring-inset ring-white/20 backdrop-blur'
      : 'bg-[var(--surface)] text-[var(--ink)] ring-1 ring-inset ring-[var(--line)]';
  const label = tone === 'light' ? 'text-white/65' : 'text-[var(--faint)]';

  return (
    <div className="flex items-start justify-center gap-2 sm:gap-3" role="timer" aria-live="off" aria-label={`${hours} hours ${minutes} minutes ${seconds} seconds`}>
      {[
        [hours, 'Hours'],
        [minutes, 'Minutes'],
        [seconds, 'Seconds'],
      ].map(([v, l], i) => (
        <div key={l} className="flex items-start gap-2 sm:gap-3">
          {i > 0 && <span className={`${big ? 'mt-3 text-2xl' : 'mt-1.5 text-lg'} font-bold opacity-50`}>:</span>}
          <div className="flex flex-col items-center">
            <span className={`grid place-items-center rounded-xl font-bold tabular tracking-tight ${box} ${big ? 'h-16 w-16 text-3xl sm:h-[72px] sm:w-[72px] sm:text-4xl' : 'h-10 w-11 text-lg'}`}>
              {pad(v)}
            </span>
            <span className={`mt-1.5 text-[10.5px] font-medium uppercase tracking-widest ${label}`}>{l}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
