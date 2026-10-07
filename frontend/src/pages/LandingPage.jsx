import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import Navbar from '../components/site/Navbar';
import Footer from '../components/site/Footer';
import NightSky from '../components/landing/NightSky';
import HeroDemo from '../components/landing/HeroDemo';
import Features from '../components/landing/Features';
import { Testimonials, Stats, Pricing, PartnerBand, FinalCta, Featured } from '../components/landing/Sections';
import { EASE } from '../components/ui/motion';
import { useTheme } from '../hooks/useTheme';

const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: EASE },
});

function Hero() {
  const { light } = useTheme();
  return (
    <section className="px-2 sm:px-3 pt-2">
      <div className="relative overflow-hidden rounded-[20px] sm:rounded-[28px] border border-white/[0.06]">
        <NightSky light={light} />
        <div className="relative mx-auto max-w-[1180px] px-5 pt-20 sm:pt-28 pb-10 sm:pb-16 text-center">
          <motion.div {...fadeUp(0)}>
            <a
              href="#features"
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 py-1 pl-1 pr-3 text-[13px] text-white/70 backdrop-blur hover:border-white/20 hover:text-white transition"
            >
              <span className="rounded-full bg-coco-purple px-2 py-0.5 text-[11px] font-semibold text-white">New</span>
              GPU Cloud is now live in three regions
              <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </a>
          </motion.div>

          <motion.h1 {...fadeUp(0.08)} className="mx-auto mt-7 max-w-4xl text-[44px] leading-[1.02] sm:text-7xl lg:text-[84px] font-bold tracking-[-0.03em]">
            <span className="text-silver">Compute without</span>
            <br />
            <span className="text-silver">compromise</span>
          </motion.h1>

          <motion.p {...fadeUp(0.16)} className="mx-auto mt-6 max-w-2xl text-[17px] sm:text-xl leading-relaxed text-white/60">
            High speed cloud computing, and the world's fastest growing {' '}
            <a href="#features" className="text-white underline decoration-coco-violet/70 decoration-2 underline-offset-[6px] hover:decoration-coco-violet">
              AI NeoCloud
            </a>{' '}
            for developers needing vCPUs, vGPUs and bare metal servers.
          </motion.p>

          <motion.div {...fadeUp(0.24)} className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#cta"
              className="group inline-flex items-center gap-2 rounded-xl bg-coco-purple px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_40px_-8px_rgba(158,0,255,0.8)] ring-1 ring-inset ring-white/20 hover:bg-[#ad1fff] transition"
            >
              Deploy
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </a>
            <Link
              to="/investors"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/50 px-6 py-3.5 text-[15px] font-semibold text-white backdrop-blur hover:bg-black/70 hover:border-white/20 transition"
            >
              Cloud Partners
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.35, ease: EASE }}
            className="relative mx-auto mt-16 sm:mt-20 max-w-[1040px] text-left"
          >
            <div className="absolute -inset-x-10 -top-10 bottom-0 rounded-full bg-coco-purple/20 blur-[90px]" />
            <HeroDemo />
            <p className="relative mt-4 text-center text-[12px] text-white/40">
              Click around or type in the terminal. The demo pauses while you explore.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const { theme } = useTheme();
  return (
    <div data-theme={theme} className="site-theme min-h-screen bg-[#0b0a10] text-white transition-colors duration-500">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <Stats />
        <Pricing />
        <PartnerBand />
        <Featured />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
