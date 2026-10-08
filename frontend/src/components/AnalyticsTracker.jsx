import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { startAnalytics, trackPageView } from '../lib/analytics';

export default function AnalyticsTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    startAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
