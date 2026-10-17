import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { canonicalUrl, routeSeo } from '../lib/seo.js';
import { setCanonical, setMeta, setRobots } from '../lib/page-meta.js';

/**
 * Keeps robots, canonical and description in step with the route during client-side navigation.
 * The first load already has them in the HTML from middleware.js; CMS pages refine theirs in CmsPage.
 */
export default function DocumentMeta() {
  const { pathname } = useLocation();
  useEffect(() => {
    const route = routeSeo(pathname);
    if (route.kind === 'public') {
      document.title = route.title;
      setRobots(true);
      setCanonical(canonicalUrl(route.path));
      setMeta('name', 'description', route.description);
    } else if (route.kind === 'cms') {
      setRobots(true);
      setCanonical(canonicalUrl(route.path));
    } else {
      setRobots(false);
      setCanonical(null);
    }
  }, [pathname]);
  return null;
}
