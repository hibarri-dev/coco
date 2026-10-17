import { Component, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import AnalyticsTracker from './components/AnalyticsTracker';
import DocumentMeta from './components/DocumentMeta';
import { AuthProvider } from './context/AuthContext';
import RequireAuth from './components/auth/RequireAuth';
import { lazyWithRetry as lazy } from './lib/chunkReload';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const InvestorsPage = lazy(() => import('./pages/InvestorsPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DevDashboard = lazy(() => import('./pages/dev/DevDashboard'));
const PackagesPage = lazy(() => import('./pages/PackagesPage'));
const JoinPage = lazy(() => import('./pages/live/JoinPage'));
const RoomPage = lazy(() => import('./pages/live/RoomPage'));
const OfferPage = lazy(() => import('./pages/live/OfferPage'));
const CheckoutPage = lazy(() => import('./pages/live/CheckoutPage'));
const CmsPage = lazy(() => import('./pages/CmsPage'));
const BlogIndex = lazy(() => import('./pages/BlogIndex'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const StorePage = lazy(() => import('./pages/StorePage'));

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

class PageErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error('[App] Page failed to render:', error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="grid min-h-screen place-items-center bg-black px-6 text-center text-white">
        <div>
          <h1 className="text-2xl font-bold">This page didn't load</h1>
          <p className="mt-2 text-[15px] text-white/60">A new version may have just been released. Reloading usually fixes it.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-coco-purple px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-[#ad1fff]"
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}

function RoutedBoundary({ children }) {
  const section = useLocation().pathname.split('/')[1];
  return <PageErrorBoundary key={section}>{children}</PageErrorBoundary>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollManager />
        <DocumentMeta />
        <AnalyticsTracker />
        <RoutedBoundary>
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/investors" element={<InvestorsPage />} />
          <Route path="/investors/login" element={<AuthPage defaultRole="investor" defaultMode="login" />} />
          <Route path="/investors/register" element={<AuthPage defaultRole="investor" defaultMode="register" />} />
          <Route path="/login" element={<AuthPage defaultRole="user" defaultMode="login" />} />
          <Route path="/register" element={<AuthPage defaultRole="user" defaultMode="register" />} />
          <Route path="/dashboard/*" element={<RequireAuth loginPath="/investors/login"><Dashboard /></RequireAuth>} />
          <Route path="/dev/*" element={<RequireAuth loginPath="/login"><DevDashboard /></RequireAuth>} />
          <Route path="/dev-demo/*" element={<DevDashboard demo />} />
          <Route path="/demo/*" element={<Dashboard demo />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
          <Route path="/live" element={<JoinPage />} />
          <Route path="/live/room" element={<RoomPage />} />
          <Route path="/live/offer" element={<OfferPage />} />
          <Route path="/live/checkout" element={<RequireAuth><CheckoutPage funnel /></RequireAuth>} />
          <Route path="/page/:slug" element={<CmsPage />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Suspense>
        </RoutedBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
