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
