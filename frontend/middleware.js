import { next, rewrite } from '@vercel/functions';
import { cleanHtml } from './src/lib/cleanHtml.js';
import { HOME_DESCRIPTION, canonicalUrl, normalizePath, routeSeo } from './src/lib/seo.js';

// Vercel Routing Middleware.
// 1. Forwards same-origin /api/* to the Coco backend so the login cookie stays first-party. COCO_BACKEND_URL is a
//    server-side Vercel env var (not VITE_, never shipped to the browser); changing it takes effect on the next deploy.
//    Locally the Vite dev proxy does this instead.
// 2. Serves the SPA shell with per-URL title, description, canonical, robots and HTTP status, so crawlers see
//    distinct pages without running JS. CMS pages (/page/:slug) also get their article content pre-filled in #root,
//    which React replaces on mount.
const FALLBACK_BACKEND = 'https://coco-production-79bd.up.railway.app';
const HIBARRI_API = (process.env.VITE_HIBARRI_API_URL || process.env.VITE_API_URL || 'https://api.hibarri.com/api').replace(/\/+$/, '');
const CMS_TIMEOUT_MS = 2500;

function backendOrigin() {
  const raw = (process.env.COCO_BACKEND_URL || FALLBACK_BACKEND).trim().replace(/\/+$/, '').replace(/\/api$/, '');
  return /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** The CMS page, `null` when it does not exist, or `undefined` when the API could not be reached. */
async function fetchCmsPage(slug) {
  try {
    const res = await fetch(`${HIBARRI_API}/pages/${encodeURIComponent(slug)}?site=coco`, {
      signal: AbortSignal.timeout(CMS_TIMEOUT_MS),
    });
    if (res.status === 404) return null;
    if (!res.ok) return undefined;
    const body = await res.json();
    return body?.page ?? null;
  } catch {
    return undefined;
  }
}

function headTags({ canonical, index, title, description, image }) {
  const tags = [`<meta name="robots" content="${index ? 'index, follow' : 'noindex, nofollow'}" />`];
  if (canonical) tags.push(`<link rel="canonical" href="${escapeHtml(canonical)}" />`);
  if (index) {
    tags.push(
      `<meta property="og:type" content="website" />`,
      `<meta property="og:site_name" content="CoCo by Hibarri" />`,
      `<meta property="og:title" content="${escapeHtml(title)}" />`,
      `<meta property="og:description" content="${escapeHtml(description)}" />`,
      `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`,
      `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
      `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    );
    if (canonical) tags.push(`<meta property="og:url" content="${escapeHtml(canonical)}" />`);
    if (image) tags.push(`<meta property="og:image" content="${escapeHtml(image)}" />`);
  }
  return tags.join('\n    ');
}

function cmsArticleHtml(page) {
  const blocks = (Array.isArray(page.content) ? page.content : [])
    .map((block) =>
      block?.type === 'image'
        ? block.value ? `<img src="${escapeHtml(block.value)}" alt="" />` : ''
        : `<div>${cleanHtml(block?.value)}</div>`,
    )
    .join('');
  return `<div style="min-height:100vh;background:#0b0a10;color:#fff"><main style="max-width:48rem;margin:0 auto;padding:9rem 1.25rem 6rem"><article>
<h1>${escapeHtml(page.title)}</h1>
${page.excerpt ? `<p>${escapeHtml(page.excerpt)}</p>` : ''}
${blocks}
</article></main></div>`;
}

function renderShell(shell, { title, description, body, ...meta }) {
  // Function replacers: CMS text contains `$` (prices), which string replacements would treat as patterns.
  return shell
    .replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${escapeHtml(title)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/i, (_, open, close) => `${open}${escapeHtml(description)}${close}`)
    .replace('</head>', () => `    ${headTags({ title, description, ...meta })}\n  </head>`)
    .replace('<div id="root"></div>', () => `<div id="root">${body ?? ''}</div>`);
}

async function renderPage(request) {
  const url = new URL(request.url);
  const path = normalizePath(url.pathname);
  if (path !== url.pathname) return Response.redirect(new URL(`${path}${url.search}`, url), 301);

  const route = routeSeo(path);
  if (route.kind === 'private') return next({ headers: { 'x-robots-tag': 'noindex, nofollow' } });

  const shellRes = await fetch(new URL('/index.html', url)).catch(() => null);
  if (!shellRes?.ok) return next();
  const shell = await shellRes.text();

  let status = 200;
  let meta;
  if (route.kind === 'public') {
    meta = { title: route.title, description: route.description, canonical: canonicalUrl(route.path), index: true };
  } else if (route.kind === 'cms') {
    const page = await fetchCmsPage(route.slug);
    const canonical = canonicalUrl(route.path);
    if (page) {
      meta = {
        title: `${page.title} | CoCo by Hibarri`,
        description: page.metaDescription?.trim() || page.excerpt?.trim() || HOME_DESCRIPTION,
        canonical,
        index: true,
        image: page.featuredImageUrl,
        body: cmsArticleHtml(page),
      };
    } else if (page === undefined) {
      meta = { title: 'CoCo by Hibarri', description: HOME_DESCRIPTION, canonical, index: true };
    } else {
      status = 404;
      meta = { title: 'Page not found · CoCo by Hibarri', description: HOME_DESCRIPTION, index: false };
    }
  } else {
    status = 404;
    meta = { title: 'Page not found · CoCo by Hibarri', description: HOME_DESCRIPTION, index: false };
  }

  return new Response(renderShell(shell, meta), {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-cache',
      ...(meta.index ? {} : { 'x-robots-tag': 'noindex, nofollow' }),
    },
  });
}

export default function middleware(request) {
  const { pathname, search } = new URL(request.url);
  if (pathname === '/api' || pathname.startsWith('/api/')) return rewrite(`${backendOrigin()}${pathname}${search}`);
  return renderPage(request);
}

// Static files (anything with a dot, e.g. /index.html, /sitemap.xml, /favicon.svg) and /assets/* skip the page renderer.
export const config = { matcher: ['/api/:path*', '/', '/((?!assets/|.*\\.).*)'] };
