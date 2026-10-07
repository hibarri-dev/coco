import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export default function ThemeToggle({ className = '' }) {
  const { light, toggle } = useTheme();
  const label = light ? 'Switch to night mode' : 'Switch to day mode';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={light ? 'Night mode' : 'Day mode'}
      className={`relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/[0.08] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={light ? 'moon' : 'sun'}
          initial={{ y: 14, rotate: -60, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -14, rotate: 60, opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="grid place-items-center"
        >
          {light ? <Moon size={17} /> : <Sun size={17} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
