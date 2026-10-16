/**
 * Writes public/sitemap.xml: key marketing URLs plus published Hibarri CMS pages (site=coco).
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_ORIGIN = 'https://coco.hibarri.com';
const STATIC = ['/', '/blog', '/packages', '/store'];
const API = (process.env.VITE_HIBARRI_API_URL ?? 'https://api.hibarri.com/api').replace(/\/+$/, '');
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public/sitemap.xml');
const today = new Date().toISOString().slice(0, 10);

function loc(pathname) {
  return pathname === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${pathname}`;
}

async function cmsPaths() {
  try {
    const res = await fetch(`${API}/pages?site=coco`);
    if (!res.ok) return [];
    const body = await res.json();
    const pages = Array.isArray(body.pages) ? body.pages : [];
    return pages
      .map((p) => p?.slug)
      .filter((slug) => typeof slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
      .map((slug) => `/page/${slug}`);
  } catch {
    return [];
  }
}

const cms = await cmsPaths();
const urls = [...STATIC, ...cms];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (pathname) => `  <url>
    <loc>${loc(pathname)}</loc>
    <lastmod>${today}</lastmod>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

writeFileSync(out, xml);
console.log(`sitemap: ${urls.length} URLs (${cms.length} CMS)`);
