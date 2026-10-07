import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Menu, X, ArrowRight } from 'lucide-react';
import { Logo } from '../Logo';
import { PlatformArt, DocsArt, EnterpriseArt } from './MenuArt';
import { EASE } from '../ui/motion';
import ThemeToggle from '../ui/ThemeToggle';
import { useTheme } from '../../hooks/useTheme';

const MENUS = [
  {
    key: 'product',
    label: 'Product',
    feature: { title: 'Platform', desc: 'Take a tour of the CoCo compute cloud', href: '/#features', art: PlatformArt },
    items: [
      { title: 'GPU Cloud', desc: 'On-demand accelerators for AI workloads', href: '/#features' },
      { title: 'Templates', desc: 'Launch production-ready stacks in a click', href: '/#features' },
      { title: 'Changelog', desc: 'Everything new across the network', href: '/#featured' },
    ],
  },
  {
    key: 'developers',
    label: 'Developers',
    feature: { title: 'Documentation', desc: 'Guides, API reference and the CoCo CLI', href: '/#features', art: DocsArt },
    items: [
      { title: 'API & CLI', desc: 'Automate every resource from your terminal', href: '/#features' },
      { title: 'Community', desc: 'Swap ideas with builders on CoCo', href: '/#testimonials' },
      { title: 'Status', desc: 'Live health of every region we run', href: '/#stats' },
    ],
  },
  {
    key: 'enterprise',
    label: 'Enterprise',
    feature: { title: 'Enterprise', desc: 'Dedicated capacity with compliance built in', href: '/#cta', art: EnterpriseArt },
    items: [
      { title: 'Customers', desc: 'Meet the teams scaling with CoCo', href: '/#testimonials' },
      { title: 'Trust center', desc: 'Security posture, audits and policies', href: '/#cta' },
    ],
  },
  {
    key: 'company',
    label: 'Company',
    feature: {
      title: 'Careers',
      desc: 'Help build the people-powered cloud',
      href: '/#cta',
      badge: 4,
      jobs: ['Senior Platform Engineer, Scheduling', 'Data Center Operations Lead', 'Partner Success Manager'],
    },
    items: [
      { title: 'Cloud Partners', desc: 'Own servers and earn from every vCPU sold', href: '/investors' },
      { title: 'Affiliate program', desc: 'Get paid for each developer you refer', href: '/#partners' },
      { title: 'About', desc: 'The team and mission behind CoCo', href: '/#cta' },
    ],
  },
];

function MenuPanel({ menu }) {
  const { feature, items } = menu;
  const Art = feature.art;
  return (
    <div className="grid grid-cols-2 gap-2 w-[640px]">
      <NavLink
        href={feature.href}
        className="group relative row-span-3 flex flex-col overflow-hidden rounded-xl bg-[#14131b] p-5 hover:bg-[#191822] transition-colors min-h-[244px]"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[15px] text-white">{feature.title}</span>
          {feature.badge && (
            <span className="rounded-md bg-coco-purple/20 px-1.5 py-0.5 text-[11px] font-semibold text-coco-lilac">{feature.badge}</span>
          )}
        </div>
        <p className="mt-1 text-sm text-white/50 leading-snug">{feature.desc}</p>
        {Art && (
          <div className="menu-art screen mt-auto h-32 pt-4 opacity-90 group-hover:opacity-100 transition-opacity">
            <Art />
          </div>
        )}
        {feature.jobs && (
          <div className="mt-5 space-y-2">
            {feature.jobs.map((job) => (
              <div key={job} className="rounded-lg bg-white/[0.04] px-3.5 py-2.5 text-[13px] text-white/70 hover:bg-white/[0.07] hover:text-white transition-colors">
                {job}
              </div>
            ))}
          </div>
        )}
      </NavLink>
      {items.map((item) => (
        <NavLink key={item.title} href={item.href} className="group rounded-xl bg-[#14131b] p-5 hover:bg-[#191822] transition-colors">
          <div className="font-semibold text-[15px] text-white flex items-center gap-1.5">
            {item.title}
            <ArrowRight size={14} className="opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0 transition-all" />
          </div>
          <p className="mt-1 text-sm text-white/50 leading-snug">{item.desc}</p>
        </NavLink>
      ))}
    </div>
  );
}

function NavLink({ href, className, children, onClick }) {
  if (href.startsWith('/#') || href.startsWith('#')) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

export default function Navbar({ themeToggle = true }) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(null);
  const [prevIndex, setPrevIndex] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [panelLeft, setPanelLeft] = useState(0);
  const triggerRefs = useRef({});
  const listRef = useRef(null);
  const closeTimer = useRef(null);

  const activeIndex = MENUS.findIndex((m) => m.key === open);
  const direction = activeIndex > prevIndex ? 1 : -1;

  const show = useCallback(
    (key) => {
      clearTimeout(closeTimer.current);
      setPrevIndex(activeIndex === -1 ? MENUS.findIndex((m) => m.key === key) : activeIndex);
      setOpen(key);
    },
    [activeIndex],
  );

  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 140);
  };

  useLayoutEffect(() => {
    if (!open || !listRef.current) return;
    const trigger = triggerRefs.current[open];
    const list = listRef.current.getBoundingClientRect();
    const t = trigger.getBoundingClientRect();
    const panelWidth = 656;
    const desired = t.left + t.width / 2 - panelWidth / 2;
    const clamped = Math.max(16, Math.min(desired, window.innerWidth - panelWidth - 16));
    setPanelLeft(clamped - list.left);
  }, [open]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      setOpen(null);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(null);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && setMobileOpen(false);
    const mq = window.matchMedia('(min-width: 1024px)');
    const onWide = (e) => e.matches && setMobileOpen(false);
    window.addEventListener('keydown', onKey);
    mq.addEventListener('change', onWide);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onWide);
    };
  }, [mobileOpen]);

  const activeMenu = MENUS[activeIndex];

  return (
    <header
      data-theme={theme}
      className={`site-theme sticky top-0 z-50 text-white transition-colors duration-300 ${
        scrolled ? 'bg-[#0b0a10]/85 backdrop-blur-xl border-b border-white/[0.06]' : 'bg-[#0b0a10] border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-5 lg:px-8">
        <Link to="/" className="flex items-center text-white shrink-0" aria-label="CoCo home">
          <Logo tagline={false} className="h-[22px] w-auto" />
        </Link>

        <nav aria-label="Main" className="hidden lg:block relative" onMouseLeave={scheduleClose}>
          <ul ref={listRef} className="flex items-center gap-1">
            {MENUS.map((menu) => (
              <li key={menu.key}>
                <button
                  ref={(el) => (triggerRefs.current[menu.key] = el)}
                  onMouseEnter={() => show(menu.key)}
                  onFocus={() => show(menu.key)}
                  onClick={() => (open === menu.key ? setOpen(null) : show(menu.key))}
                  aria-expanded={open === menu.key}
                  className={`flex items-center gap-1 rounded-lg px-3 py-2 text-[14px] font-medium transition-colors ${
                    open === menu.key ? 'bg-white/[0.07] text-white' : 'text-white/75 hover:text-white'
                  }`}
                >
                  {menu.label}
                  <ChevronDown size={14} className={`text-white/40 transition-transform duration-300 ${open === menu.key ? 'rotate-180' : ''}`} />
                </button>
              </li>
            ))}
            <li>
              <a href="/#pricing" onMouseEnter={scheduleClose} className="rounded-lg px-3 py-2 text-[14px] font-medium text-white/75 hover:text-white transition-colors">
                Pricing
              </a>
            </li>
          </ul>

          <AnimatePresence>
            {activeMenu && (
              <motion.div
                key="panel"
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1, left: panelLeft }}
                exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.15 } }}
                transition={{ duration: 0.32, ease: EASE }}
                style={{ left: panelLeft }}
                className="absolute top-full pt-3"
                onMouseEnter={() => clearTimeout(closeTimer.current)}
              >
                <motion.div layout transition={{ duration: 0.32, ease: EASE }} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
                  <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                    <motion.div
                      key={activeMenu.key}
                      custom={direction}
                      variants={{
                        enter: (d) => ({ opacity: 0, x: d * 40 }),
                        center: { opacity: 1, x: 0 },
                        exit: (d) => ({ opacity: 0, x: d * -40 }),
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.28, ease: EASE }}
                      onClick={() => setOpen(null)}
                    >
                      <MenuPanel menu={activeMenu} />
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {themeToggle && <ThemeToggle />}
          <Link to="/dashboard" className="rounded-lg px-3 py-2 text-[14px] font-medium text-white/80 hover:text-white transition-colors">
            Sign in
          </Link>
          <a
            href="/#cta"
            className="rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[14px] font-medium text-white hover:bg-white/[0.08] hover:border-white/20 transition-colors"
          >
            Book a demo
          </a>
        </div>

        <div className="flex items-center gap-1.5 lg:hidden">
          {themeToggle && <ThemeToggle />}
          <Link to="/dashboard" className="hidden sm:inline-flex rounded-lg px-3 py-2 text-[14px] font-medium text-white/80 hover:text-white">
            Sign in
          </Link>
          <a href="/#cta" className="hidden sm:inline-flex rounded-lg bg-coco-purple px-3.5 py-2 text-[14px] font-semibold text-white hover:bg-[#ad1fff] transition-colors">
            Book a demo
          </a>
          <button
            className="grid h-10 w-10 place-items-center rounded-lg text-white/80 hover:bg-white/10"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {createPortal(<AnimatePresence>{mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}</AnimatePresence>, document.body)}
    </header>
  );
}

function MobileMenu({ onClose }) {
  const [expanded, setExpanded] = useState(null);
  const { theme } = useTheme();
  return (
    <motion.div
      data-theme={theme}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="site-theme fixed inset-0 z-[80] flex h-[100dvh] flex-col bg-[#08070c] text-white lg:hidden"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, transition: { duration: 0.18 } }}
      transition={{ duration: 0.28, ease: EASE }}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.06] px-5">
        <Link to="/" onClick={onClose} className="text-white" aria-label="CoCo home">
          <Logo tagline={false} className="h-[22px] w-auto" />
        </Link>
        <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-lg text-white/80 hover:bg-white/10" aria-label="Close menu">
          <X size={22} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-3">
        <Link
          to="/investors"
          onClick={onClose}
          className="mb-2 flex items-center justify-between rounded-2xl border border-coco-purple/30 bg-coco-purple/10 px-4 py-3.5"
        >
          <span>
            <span className="block text-[15px] font-semibold">Cloud Partners</span>
            <span className="block text-[13px] text-white/55">Own servers and earn from every vCPU sold</span>
          </span>
          <ArrowRight size={18} className="text-coco-lilac" />
        </Link>
        {MENUS.map((menu, i) => (
          <motion.div
            key={menu.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.04, duration: 0.3, ease: EASE }}
            className="border-b border-white/[0.06]"
          >
            <button
              className="flex w-full items-center justify-between py-4 text-lg font-medium"
              onClick={() => setExpanded(expanded === menu.key ? null : menu.key)}
              aria-expanded={expanded === menu.key}
            >
              {menu.label}
              <ChevronDown size={18} className={`text-white/40 transition-transform ${expanded === menu.key ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {expanded === menu.key && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="pb-4 space-y-1">
                    {[menu.feature, ...menu.items].map((item) => (
                      <NavLink key={item.title} href={item.href} onClick={onClose} className="block rounded-xl px-3 py-3 hover:bg-white/[0.05]">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-white/50">{item.desc}</div>
                      </NavLink>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
        <a href="/#pricing" onClick={onClose} className="block py-4 text-lg font-medium border-b border-white/[0.06]">
          Pricing
        </a>
      </div>
      <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-white/[0.06] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <Link to="/dashboard" onClick={onClose} className="rounded-xl border border-white/10 py-3 text-center font-medium">
          Sign in
        </Link>
        <a href="/#cta" onClick={onClose} className="rounded-xl bg-coco-purple py-3 text-center font-semibold">
          Book a demo
        </a>
      </div>
    </motion.div>
  );
}
