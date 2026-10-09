import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowDownRight, ArrowRight, Sparkles } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { Logo } from '../components/Logo';
import Navbar from '../components/site/Navbar';
import PartnerDemo from '../components/investors/PartnerDemo';
import { Manifesto, Bento, HowItWorks, Faq, InvestorCta } from '../components/investors/Sections';
import HardwareToSoftware from '../components/investors/HardwareToSoftware';
import LoadBalancing from '../components/investors/LoadBalancing';
import Whitepaper from '../components/investors/Whitepaper';
import ServerPackages from '../components/funnel/ServerPackages';
import { RealEstateVsServers, Testimonials } from '../components/funnel/Sections';
import { EASE } from '../components/ui/motion';

const rise = (delay) => ({
  initial: { opacity: 0, y: 22, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.9, delay, ease: EASE },
});

function Hero({ light, onBuy }) {
  return (
    <section className="px-3 pt-3">
      <div className="relative overflow-hidden rounded-[28px]">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,#8b4fb3_0%,#6a2bb8_30%,#3f1a9e_60%,#1c0c52_100%)] bg-[length:180%_180%] animate-gradient" />
        <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-[#c77dff]/30 blur-[120px]" />
        <div className="absolute right-0 bottom-0 h-[500px] w-[700px] rounded-full bg-[#2a0a7a]/60 blur-[120px]" />
        <div className="absolute inset-0 bg-grain opacity-[0.18] mix-blend-overlay" />

        <div className="relative mx-auto max-w-[1100px] px-5 pt-20 sm:pt-28 pb-16 sm:pb-24 text-center text-white">
          <motion.div {...rise(0)}>
            <Link
              to="/live"
              className="group inline-flex items-center gap-2 rounded-full bg-black/35 py-1.5 pl-1.5 pr-4 text-[13px] text-white/80 backdrop-blur transition hover:bg-black/50 hover:text-white"
            >
              <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[12px] font-semibold text-white">
                <Sparkles size={12} className="text-[#d9a6ff]" /> Free broadcast
              </span>
              Real Estate vs Digital Estate, daily at 7pm
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
          <motion.h1 {...rise(0.08)} className="mx-auto mt-7 max-w-4xl text-[46px] sm:text-7xl lg:text-[86px] font-bold leading-[0.98] tracking-[-0.035em]">
            Cloud investing,
            <br />
            <span className="bg-gradient-to-r from-white via-[#ead6ff] to-[#c9a8ff] bg-clip-text text-transparent">made easy</span>
          </motion.h1>
          <motion.p {...rise(0.16)} className="mx-auto mt-6 max-w-2xl text-[17px] sm:text-xl leading-relaxed text-white/75">
            Buy real servers in real time. We rack them, sell the compute to developers and pay you every month, all tracked in your investment dashboard.
          </motion.p>
          <motion.div {...rise(0.24)} className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a href="#packages" className="group flex items-center gap-3 rounded-xl bg-white pl-5 pr-1.5 py-1.5 text-[15px] font-semibold text-black shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]">
              Browse packages
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#c9a8ff] transition group-hover:bg-coco-purple group-hover:text-white">
                <ArrowDownRight size={17} />
              </span>
            </a>
            <Link to="/dashboard" className="rounded-xl bg-black/40 px-5 py-3.5 text-[15px] font-semibold text-white backdrop-blur hover:bg-black/60 transition">
              See the dashboard
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 60, rotateX: 12 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1.2, delay: 0.35, ease: EASE }}
            style={{ transformPerspective: 1400 }}
            className="mx-auto mt-16 max-w-[980px] text-left"
          >
            <PartnerDemo light={light} onBuy={onBuy} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function InvestorFooter() {
  return (
    <footer className="mx-auto flex max-w-[1180px] flex-col gap-6 px-6 py-12 text-[13px] text-[var(--faint)] sm:flex-row sm:items-center sm:justify-between">
      <Link to="/" className="text-[var(--ink)]"><Logo className="h-10 w-auto" /></Link>
      <div className="flex flex-wrap gap-6">
        <Link to="/" className="hover:text-[var(--ink)]">CoCo Cloud</Link>
        <Link to="/dashboard" className="hover:text-[var(--ink)]">Partner dashboard</Link>
        <a href="#whitepaper" className="hover:text-[var(--ink)]">White paper</a>
        <a href="#faq" className="hover:text-[var(--ink)]">FAQ</a>
        <a href="mailto:partners@hibarri.com" className="hover:text-[var(--ink)]">Contact</a>
      </div>
      <span>© {new Date().getFullYear()} Hibarri</span>
    </footer>
  );
}

export default function InvestorsPage() {
  const { theme, light } = useTheme();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });

  const onBuy = useCallback(() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' }), []);

  return (
    <div data-theme={theme} className="inv-theme min-h-screen bg-[var(--page)] text-[var(--ink)] transition-colors duration-500">
      <motion.div className="fixed left-0 top-0 z-[70] h-[3px] w-full origin-left bg-gradient-to-r from-coco-purple to-coco-lilac" style={{ scaleX: progress }} />
      <Navbar themeToggle />
      <main>
        <Hero light={light} onBuy={onBuy} />
        <Manifesto />
        <HardwareToSoftware />
        <LoadBalancing />
        <Bento />
        <HowItWorks />
        <RealEstateVsServers ctaTo="#packages" />
        <Whitepaper />
        <Testimonials />
        <ServerPackages className="pb-28 sm:pb-36" />
        <Faq />
        <InvestorCta />
      </main>
      <InvestorFooter />
    </div>
  );
}
