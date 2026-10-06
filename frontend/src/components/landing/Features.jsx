import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Network, Layers, Activity, GitBranch, ArrowRight } from 'lucide-react';
import { DeployVisual, NetworkVisual, ScaleVisual, MonitorVisual, EvolveVisual } from './FeatureVisuals';
import { Reveal } from '../ui/motion';

const FEATURES = [
  {
    key: 'deploy',
    label: 'Deploy',
    icon: Rocket,
    title: 'Ship any workload, skip the plumbing',
    body: 'Point CoCo at a repo or container image. We detect the runtime, build it, and place it on the right hardware, from a single vCPU to a rack of GPUs.',
    Visual: DeployVisual,
  },
  {
    key: 'network',
    label: 'Network',
    icon: Network,
    title: 'A private network across every rack',
    body: 'Services talk over encrypted internal links the moment they launch. Public endpoints get TLS and load balancing with zero configuration.',
    Visual: NetworkVisual,
  },
  {
    key: 'scale',
    label: 'Scale',
    icon: Layers,
    title: 'From one replica to a global fleet',
    body: 'Workloads spread across partner servers in multiple regions automatically, so capacity grows with your traffic instead of your ops team.',
    Visual: ScaleVisual,
  },
  {
    key: 'monitor',
    label: 'Monitor',
    icon: Activity,
    title: 'Every metric, metered to the second',
    body: 'Live CPU, memory, GPU and network graphs, searchable logs and alerts, with billing that matches exactly what you ran and nothing more.',
    Visual: MonitorVisual,
  },
  {
    key: 'evolve',
    label: 'Evolve',
    icon: GitBranch,
    title: 'Environments that move as fast as you do',
    body: 'Every pull request gets its own preview. Promote to production with confidence, and roll back in one click if something looks off.',
    Visual: EvolveVisual,
  },
];

export default function Features() {
  const [active, setActive] = useState(FEATURES[0].key);
  const refs = useRef({});

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.dataset.key);
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    );
    Object.values(refs.current).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const activeIndex = FEATURES.findIndex((f) => f.key === active);

  return (
    <section id="features" className="relative mx-auto max-w-[1240px] px-5 lg:px-8 py-24 sm:py-32">
      <Reveal className="max-w-2xl">
        <div className="text-[13px] font-semibold uppercase tracking-[0.2em] text-coco-violet">The platform</div>
        <h2 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight leading-[1.05]">
          Everything you need to run in production. <span className="text-white/40">Nothing you don't.</span>
        </h2>
      </Reveal>

      <div className="mt-16 grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-16">
        <aside className="hidden lg:block">
          <nav className="sticky top-28" aria-label="Platform sections">
            <div className="relative pl-5">
              <div className="absolute left-0 top-1 bottom-1 w-px bg-white/10" />
              <motion.div
                className="absolute left-0 w-px bg-coco-violet shadow-[0_0_12px_#b54dff]"
                animate={{ top: activeIndex * 48 + 6, height: 28 }}
                transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              />
              {FEATURES.map((f) => (
                <a
                  key={f.key}
                  href={`#feature-${f.key}`}
                  className={`flex h-12 items-center gap-3 text-[15px] font-medium transition-colors ${active === f.key ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                >
                  <f.icon size={16} className={active === f.key ? 'text-coco-violet' : ''} />
                  {f.label}
                </a>
              ))}
            </div>
          </nav>
        </aside>

        <div className="space-y-28 sm:space-y-36">
          {FEATURES.map((f) => (
            <div key={f.key} id={`feature-${f.key}`} data-key={f.key} ref={(el) => (refs.current[f.key] = el)} className="scroll-mt-28">
              <Reveal>
                <div className="flex items-center gap-2 text-[13px] font-semibold text-coco-lilac">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-coco-purple/15">
                    <f.icon size={14} />
                  </span>
                  {f.label}
                </div>
                <h3 className="mt-5 max-w-xl text-3xl sm:text-4xl font-bold tracking-tight leading-tight">{f.title}</h3>
                <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-white/55">{f.body}</p>
                <a href="#cta" className="group mt-5 inline-flex items-center gap-1.5 text-[15px] font-medium text-white/80 hover:text-white">
                  Learn more <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </a>
              </Reveal>
              <Reveal delay={0.1} className="mt-9">
                <f.Visual />
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
