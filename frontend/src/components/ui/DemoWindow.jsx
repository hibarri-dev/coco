import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useMotionValue, useTransform } from 'framer-motion';
import { EASE } from './motion';

/**
 * Browser-framed interactive product demo: sidebar navigation, auto-advancing views with a
 * progress bar, pauses while hovered or focused, and resumes from where it left off.
 *
 * views: [{ key, label, icon, path, duration?, render: ({ active }) => node }]
 */
export default function DemoWindow({ host, views, duration = 6000, badge = 'Interactive demo · sample data', className = '', light = false }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const rootRef = useRef(null);
  const inView = useInView(rootRef, { margin: '-15% 0px -15% 0px' });
  const progress = useMotionValue(0);
  const width = useTransform(progress, (p) => `${p * 100}%`);

  const paused = hovered || focused || !inView;
  const current = views[index];
  const slot = current.duration ?? duration;

  const go = useCallback(
    (i) => {
      progress.set(0);
      setIndex(((i % views.length) + views.length) % views.length);
    },
    [progress, views.length],
  );

  useEffect(() => {
    let raf;
    let last = performance.now();
    const tick = (now) => {
      const dt = now - last;
      last = now;
      if (!paused && !document.hidden) {
        const next = progress.get() + dt / slot;
        if (next >= 1) {
          go(index + 1);
          return;
        }
        progress.set(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, slot, index, go, progress]);

  const onKeyDown = (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      go(index - 1);
    }
  };

  const t = light
    ? {
        frame: 'bg-white border-black/10 shadow-[0_40px_120px_-40px_rgba(60,0,110,0.45)]',
        header: 'border-black/[0.07]',
        pill: 'bg-black/[0.05] text-black/60',
        track: 'bg-black/[0.06]',
        side: 'bg-[#f6f5f9] border-black/[0.07]',
        item: 'text-black/55 hover:text-black hover:bg-black/[0.04]',
        itemOn: 'text-black bg-white shadow-sm ring-1 ring-black/[0.06]',
        body: 'bg-[#fbfbfd]',
      }
    : {
        frame: 'bg-[#0d0c12] border-white/[0.09] shadow-[0_40px_140px_-30px_rgba(158,0,255,0.45)]',
        header: 'border-white/[0.07]',
        pill: 'bg-white/[0.06] text-white/60',
        track: 'bg-white/[0.05]',
        side: 'bg-[#0f0e14] border-white/[0.06]',
        item: 'text-white/55 hover:text-white hover:bg-white/[0.04]',
        itemOn: 'text-white bg-[#2a2440] ring-1 ring-coco-violet/40',
        body: 'bg-[#15141b]',
      };

  return (
    <div
      ref={rootRef}
      className={`relative overflow-hidden rounded-2xl border ${t.frame} ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onKeyDown={onKeyDown}
    >
      <div className={`relative flex h-11 items-center gap-3 border-b px-4 ${t.header}`}>
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]/90" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]/90" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]/90" />
        </div>
        <div className={`ml-2 flex min-w-0 items-center rounded-full px-3 py-1 text-[12px] font-medium ${t.pill}`}>
          <span className="truncate">{host}</span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={current.path}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="whitespace-nowrap"
            >
              {current.path}
            </motion.span>
          </AnimatePresence>
        </div>
        {badge && (
          <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 rounded-full bg-coco-purple/15 px-2.5 py-1 text-[11px] font-medium text-coco-violet">
            <span className={`h-1.5 w-1.5 rounded-full bg-coco-violet ${paused ? '' : 'animate-pulse'}`} />
            {paused && inView ? 'Paused · explore freely' : badge}
          </span>
        )}
        <div className={`absolute inset-x-0 -bottom-px h-[2px] ${t.track}`}>
          <motion.div className="h-full bg-gradient-to-r from-coco-purple to-coco-violet" style={{ width }} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:h-[460px]">
        <nav
          aria-label="Demo sections"
          className={`no-scrollbar flex shrink-0 gap-1 overflow-x-auto border-b p-2 md:w-[190px] md:flex-col md:overflow-visible md:border-b-0 md:border-r md:p-3 ${t.side}`}
        >
          {views.map((v, i) => {
            const on = i === index;
            return (
              <button
                key={v.key}
                onClick={() => go(i)}
                aria-current={on ? 'page' : undefined}
                className={`relative flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors md:w-full ${on ? t.itemOn : t.item}`}
              >
                <v.icon size={15} className="shrink-0" />
                {v.label}
              </button>
            );
          })}
        </nav>

        <div
          className={`relative min-h-[420px] flex-1 overflow-hidden ${t.body}`}
          onFocusCapture={(e) => e.target.matches('input, textarea') && setFocused(true)}
          onBlurCapture={(e) => e.target.matches('input, textarea') && setFocused(false)}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="absolute inset-0 overflow-y-auto p-4 sm:p-6"
            >
              {current.render({ active: true, next: () => go(index + 1) })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
