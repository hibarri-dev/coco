/** Public site origin. Search Console, the sitemap and canonical URLs all use this host. */
export const SITE_ORIGIN = 'https://coco.hibarri.com';

export const HOME_DESCRIPTION =
  'CoCo by Hibarri is an AI NeoCloud and general-purpose cloud for developers, powered by a network of partner-owned servers.';

export const CMS_PAGE_PREFIX = '/page/';

const CMS_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizePath(pathname) {
  const path = (pathname.split('?')[0]?.split('#')[0] ?? '/').replace(/\/+$/, '') || '/';
  return path === '' ? '/' : path;
}

/** Slug from `/page/my-slug`, or null when the path is not a public CMS URL. */
export function cmsPageSlugFromPath(pathname) {
  const path = normalizePath(pathname);
  if (!path.startsWith(CMS_PAGE_PREFIX)) return null;
  const slug = path.slice(CMS_PAGE_PREFIX.length);
  if (!slug || !CMS_SLUG_RE.test(slug)) return null;
  return slug;
}

export const HOME_TITLE = 'CoCo by Hibarri | The AI NeoCloud for developers';

/** Indexable marketing routes. Titles match what each page sets client-side. Also feeds the sitemap. */
export const PUBLIC_ROUTES = {
  '/': { title: HOME_TITLE, description: HOME_DESCRIPTION },
  '/investors': {
    title: 'Invest in compute · CoCo by Hibarri',
    description: 'Own partner servers on the CoCo network and earn revenue from the compute developers rent on them.',
  },
  '/live': {
    title: 'Real Estate vs Digital Estate · CoCo by Hibarri',
    description: 'Join the CoCo live broadcast on why compute is the new real estate and how to own a share of it.',
  },
  '/packages': {
    title: 'Server packages · CoCo by Hibarri',
    description: 'Compare CoCo server packages: dedicated vCPU, RAM and optional vGPU for apps, APIs and AI workloads.',
  },
  '/store': {
    title: 'Store · CoCo by Hibarri',
    description: 'Buy CoCo cloud servers and compute packages for your apps, APIs and AI workloads.',
  },
  '/blog': {
    title: 'Blog | CoCo by Hibarri',
    description: 'Guides, comparisons and news on cloud hosting, AI compute and deploying apps with CoCo.',
  },
};

/** App routes that must never be indexed (auth, dashboards, checkout, funnel steps). A trailing `/*` also matches subpaths. */
const PRIVATE_ROUTES = [
  '/login',
  '/register',
  '/investors/login',
  '/investors/register',
  '/dashboard/*',
  '/dev/*',
  '/dev-demo/*',
  '/demo/*',
  '/checkout',
  '/live/room',
  '/live/offer',
  '/live/checkout',
];

function isPrivate(path) {
  return PRIVATE_ROUTES.some((route) => {
    if (!route.endsWith('/*')) return path === route;
    const base = route.slice(0, -2);
    return path === base || path.startsWith(`${base}/`);
  });
}

/**
 * How search engines should treat a path:
 * `public` (indexable, with title/description), `cms` (indexable CMS page), `private` (noindex), or `unknown` (404).
 */
export function routeSeo(pathname) {
  const path = normalizePath(pathname);
  if (PUBLIC_ROUTES[path]) return { kind: 'public', path, ...PUBLIC_ROUTES[path] };
  const slug = cmsPageSlugFromPath(path);
  if (slug) return { kind: 'cms', path: `${CMS_PAGE_PREFIX}${slug}`, slug };
  if (isPrivate(path)) return { kind: 'private', path };
  return { kind: 'unknown', path };
}

export function canonicalUrl(path) {
  return path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`;
}
