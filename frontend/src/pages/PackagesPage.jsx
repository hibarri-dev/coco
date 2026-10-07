import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import Navbar from '../components/site/Navbar';
import ServerPackages from '../components/funnel/ServerPackages';
import { EASE } from '../components/ui/motion';

export default function PackagesPage() {
  const { theme } = useTheme();

  useEffect(() => {
    document.title = 'Server packages · CoCo by Hibarri';
  }, []);

  return (
    <div data-theme={theme} className="inv-theme min-h-screen bg-[var(--page)] text-[var(--ink)] transition-colors duration-500">
      <Navbar themeToggle />
      <main className="pb-32 lg:pb-16">
        <section className="px-3 pt-3">
          <div className="relative overflow-hidden rounded-[28px]">
            <div className="absolute inset-0 animate-gradient bg-[linear-gradient(115deg,#8b4fb3_0%,#6a2bb8_30%,#3f1a9e_60%,#1c0c52_100%)] bg-[length:180%_180%]" />
            <div className="absolute inset-0 bg-grain opacity-[0.18] mix-blend-overlay" />
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="relative mx-auto max-w-3xl px-5 pb-14 pt-16 text-center text-white sm:pb-20 sm:pt-24"
            >
              <div className="text-[13px] font-semibold text-white/70">Server packages</div>
              <h1 className="mt-3 text-[40px] font-bold leading-[1.02] tracking-[-0.03em] sm:text-6xl">Own servers in 9 countries</h1>
              <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-white/75">
                Choose where your servers live, pick from Dell PowerEdge Smart Selection models and get everything racked, connected and earning for you.
              </p>
              <Link to="/live" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-black/35 px-5 py-3 text-[14px] font-semibold backdrop-blur transition hover:bg-black/55">
                <PlayCircle size={17} /> New here? Watch the free broadcast first
              </Link>
            </motion.div>
          </div>
        </section>
        <ServerPackages heading={false} className="pt-12 sm:pt-16" />
      </main>
    </div>
  );
}
