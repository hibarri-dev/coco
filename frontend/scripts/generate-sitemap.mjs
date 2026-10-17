/**
 * Writes public/sitemap.xml: public marketing routes plus published Hibarri CMS pages (site=coco).
 * If the CMS API can't be reached the existing sitemap is kept, so a flaky build never drops the CMS URLs.
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PUBLIC_ROUTES, canonicalUrl, cmsPageSlugFromPath } from '../src/lib/seo.js';

const API = (process.env.VITE_HIBARRI_API_URL || process.env.VITE_API_URL || 'https://api.hibarri.com/api').replace(/\/+$/, '');
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public/sitemap.xml');

function day(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : null;
}

/** Published CMS pages as `{ path, lastmod }`, or null when the API is unavailable. */
async function cmsEntries() {
  try {
    const res = await fetch(`${API}/pages?site=coco`, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    const body = await res.json();
    if (!Array.isArray(body.pages)) return null;
    return body.pages
      .filter((p) => typeof p?.slug === 'string' && cmsPageSlugFromPath(`/page/${p.slug}`))
      .map((p) => ({ path: `/page/${p.slug}`, lastmod: day(p.updatedAt || p.publishedAt || p.createdAt) }));
  } catch {
    return null;
  }
}

const cms = await cmsEntries();
if (!cms) {
  console.warn(`sitemap: CMS API unavailable (${API}), keeping existing public/sitemap.xml`);
  process.exit(0);
}

const entries = [...Object.keys(PUBLIC_ROUTES).map((p) => ({ path: p, lastmod: null })), ...cms];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    ({ path: pathname, lastmod }) => `  <url>
    <loc>${canonicalUrl(pathname)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
  </url>`,
  )
  .join('\n')}
</urlset>
`;

writeFileSync(out, xml);
console.log(`sitemap: ${entries.length} URLs (${cms.length} CMS)`);
