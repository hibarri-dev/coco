import { useEffect, useState } from 'react';
import { NavLink, Route, Routes, useLocation, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard, Server, Users, CreditCard, Wallet, Receipt, ShoppingCart, Bell, Search, Menu, X, LogOut, ChevronDown, Plus,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { PARTNER, PORTFOLIO } from '../data/dashboard';
import { usd } from '../data/packages';
import Portfolio from './dashboard/Portfolio';
import Servers from './dashboard/Servers';
import ServerDetail from './dashboard/ServerDetail';
import Customers from './dashboard/Customers';
import Payments from './dashboard/Payments';
import Payouts from './dashboard/Payouts';
import Billing from './dashboard/Billing';
import BuyServers from './dashboard/BuyServers';

const NAV = [
  { to: '/dashboard', label: 'My Portfolio', icon: LayoutDashboard, end: true },
  { to: '/dashboard/servers', label: 'Servers', icon: Server, count: PORTFOLIO.activeServers },
  { to: '/dashboard/customers', label: 'Customers', icon: Users, count: PORTFOLIO.activeCustomers },
  { to: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { to: '/dashboard/payouts', label: 'Payouts', icon: Wallet },
  { to: '/dashboard/billing', label: 'Billing', icon: Receipt },
  { to: '/dashboard/buy', label: 'Buy Servers', icon: ShoppingCart, highlight: true },
];

function Sidebar({ onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <Link to="/" className="text-white" aria-label="CoCo home">
          <Logo tagline={false} className="h-[18px] w-auto" />
        </Link>
        <span className="rounded-md border border-coco-purple/30 bg-coco-purple/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-coco-lilac">
          Partner
        </span>
      </div>

      <nav className="mt-3 flex-1 space-y-0.5 px-3" aria-label="Dashboard">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-white/30">Menu</div>
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate} className="relative block">
            {({ isActive }) => (
              <span
                className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-white/55 hover:bg-white/[0.03] hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="dash-nav"
                    className="absolute inset-0 rounded-xl border border-white/[0.08] bg-white/[0.06]"
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  />
                )}
                {isActive && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-coco-violet shadow-[0_0_10px_#b54dff]" />}
                <item.icon size={17} className={`relative ${isActive ? 'text-coco-lilac' : ''}`} />
                <span className="relative flex-1">{item.label}</span>
                {item.count && <span className="relative rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[11px] text-white/50 tabular">{item.count}</span>}
                {item.highlight && <span className="relative h-1.5 w-1.5 rounded-full bg-coco-violet" />}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3">
        <div className="relative overflow-hidden rounded-2xl border border-coco-purple/25 bg-[#120a1d] p-4">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-coco-purple/30 blur-2xl" />
          <div className="relative text-[12px] text-white/50">Pending payout</div>
          <div className="relative mt-1 text-2xl font-bold tabular">{usd(PORTFOLIO.pendingPayout)}</div>
          <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[77%] rounded-full bg-gradient-to-r from-coco-purple to-coco-lilac" />
          </div>
          <div className="relative mt-2 text-[12px] text-white/50">Next payout in <span className="font-semibold text-white">{PORTFOLIO.nextPayoutDays} days</span></div>
        </div>
        <div className="mt-3 flex items-center gap-3 rounded-xl px-2 py-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-coco-violet to-[#2b0750] text-[12px] font-semibold">{PARTNER.initials}</span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold">{PARTNER.name}</div>
            <div className="truncate text-[11.5px] text-white/40">{PARTNER.company}</div>
          </div>
          <Link to="/" className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white" aria-label="Sign out">
            <LogOut size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Topbar({ onMenu }) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[0.06] bg-[#08070c]/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <button onClick={onMenu} className="rounded-lg p-2 text-white/70 hover:bg-white/5 lg:hidden" aria-label="Open navigation">
        <Menu size={20} />
      </button>
      <label className="hidden max-w-sm flex-1 items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-2 text-[13px] text-white/40 md:flex">
        <Search size={15} />
        <input placeholder="Search servers, customers, invoices…" className="flex-1 bg-transparent text-white outline-none placeholder:text-white/35" />
        <kbd className="rounded border border-white/10 px-1.5 text-[10px] text-white/40">⌘K</kbd>
      </label>
      <div className="ml-auto flex items-center gap-2">
        <span className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1.5 text-[12px] text-emerald-300 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> All systems operational
        </span>
        <button className="relative rounded-xl border border-white/[0.07] p-2.5 text-white/60 hover:text-white" aria-label="Notifications">
          <Bell size={16} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-coco-violet ring-2 ring-[#08070c]" />
        </button>
        <button onClick={() => navigate('/dashboard/buy')} className="hidden items-center gap-1.5 rounded-xl bg-coco-purple px-3.5 py-2.5 text-[13px] font-semibold hover:bg-[#ad1fff] transition sm:flex">
          <Plus size={15} /> Buy server
        </button>
        <button className="flex items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-white/5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-coco-violet to-[#2b0750] text-[11px] font-semibold">{PARTNER.initials}</span>
          <ChevronDown size={14} className="hidden text-white/40 sm:block" />
        </button>
      </div>
    </header>
  );
}

export default function Dashboard() {
  const location = useLocation();
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    document.title = 'Partner Dashboard · CoCo by Hibarri';
  }, []);

  return (
    <div className="min-h-screen bg-[#08070c] text-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] border-r border-white/[0.06] bg-[#0a090e] lg:block">
        <Sidebar />
      </aside>

      <AnimatePresence>
        {mobileNav && (
          <>
            <motion.button
              aria-label="Close navigation"
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNav(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-white/[0.06] bg-[#0a090e] lg:hidden"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            >
              <button onClick={() => setMobileNav(false)} className="absolute right-3 top-4 rounded-lg p-2 text-white/60 hover:bg-white/5" aria-label="Close">
                <X size={18} />
              </button>
              <Sidebar onNavigate={() => setMobileNav(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-[264px]">
        <Topbar onMenu={() => setMobileNav(true)} />
        <main className="mx-auto max-w-[1400px] px-4 py-7 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route index element={<Portfolio />} />
              <Route path="servers" element={<Servers />} />
              <Route path="servers/:id" element={<ServerDetail />} />
              <Route path="customers" element={<Customers />} />
              <Route path="payments" element={<Payments />} />
              <Route path="payouts" element={<Payouts />} />
              <Route path="billing" element={<Billing />} />
              <Route path="buy" element={<BuyServers />} />
              <Route path="*" element={<Portfolio />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
