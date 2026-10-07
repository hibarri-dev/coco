import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { EASE } from '../ui/motion';

export function Modal({ open, onClose, title, children }) {
  const panel = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && closeRef.current();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => (panel.current?.querySelector('input, textarea, select') ?? panel.current?.querySelector('button'))?.focus(), 60);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      clearTimeout(t);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button aria-label="Close" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-[var(--line)] bg-[var(--surface)] p-6 text-[var(--ink)] shadow-2xl sm:max-w-[460px] sm:rounded-3xl sm:p-7"
          >
            <button onClick={onClose} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-[var(--muted)] hover:bg-[var(--surface-2)]" aria-label="Close">
              <X size={18} />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Field({ label, error, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[13px] font-medium">{label}</span>
      <input
        {...props}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-xl border bg-[var(--surface-2)] px-3.5 py-3 text-[15px] outline-none transition placeholder:text-[var(--faint)] focus:border-coco-purple focus:ring-2 focus:ring-coco-purple/20 ${
          error ? 'border-rose-400' : 'border-[var(--line)]'
        }`}
      />
      {error && <span className="mt-1 block text-[12px] text-rose-500">{error}</span>}
    </label>
  );
}
