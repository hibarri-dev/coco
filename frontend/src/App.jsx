import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import AnalyticsTracker from './components/AnalyticsTracker';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const InvestorsPage = lazy(() => import('./pages/InvestorsPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PackagesPage = lazy(() => import('./pages/PackagesPage'));
const JoinPage = lazy(() => import('./pages/live/JoinPage'));
const RoomPage = lazy(() => import('./pages/live/RoomPage'));
const OfferPage = lazy(() => import('./pages/live/OfferPage'));
const CheckoutPage = lazy(() => import('./pages/live/CheckoutPage'));
const CmsPage = lazy(() => import('./pages/CmsPage'));

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      let tries = 0;
      let t;
      const attempt = () => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else if (tries++ < 20) t = setTimeout(attempt, 80);
      };
      t = setTimeout(attempt, 60);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <AnalyticsTracker />
      <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/investors" element={<InvestorsPage />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/live" element={<JoinPage />} />
          <Route path="/live/room" element={<RoomPage />} />
          <Route path="/live/offer" element={<OfferPage />} />
          <Route path="/live/checkout" element={<CheckoutPage funnel />} />
          <Route path="/page/:slug" element={<CmsPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
