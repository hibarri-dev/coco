import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_ORIGIN, cmsPageSlugFromPath } from '../lib/seo.js';
import { setCanonical, setRobots } from '../lib/page-meta.js';

/** Keeps robots and canonical in step for indexable CMS URLs at /page/:slug. */
export default function DocumentMeta() {
  const { pathname } = useLocation();
  useEffect(() => {
    const slug = cmsPageSlugFromPath(pathname);
    if (slug) {
      setRobots(true);
      setCanonical(`${SITE_ORIGIN}/page/${slug}`);
    }
  }, [pathname]);
  return null;
}
