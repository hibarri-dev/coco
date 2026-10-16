import { HOME_DESCRIPTION, SITE_ORIGIN } from './seo.js';

export function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

export function setRobots(index) {
  setMeta('name', 'robots', index ? 'index, follow' : 'noindex, nofollow');
}

export function setCanonical(href) {
  let canon = document.head.querySelector('link[rel="canonical"]');
  if (href) {
    if (!canon) {
      canon = document.createElement('link');
      canon.rel = 'canonical';
      document.head.appendChild(canon);
    }
    canon.href = href;
  } else {
    canon?.remove();
  }
}

/** Title, description, canonical and robots for a published Hibarri CMS page. */
export function applyCmsPageMeta(page) {
  const title = `${page.title} | CoCo by Hibarri`;
  const description = page.metaDescription?.trim() || HOME_DESCRIPTION;
  const canonical = `${SITE_ORIGIN}/page/${page.slug}`;
  document.title = title;
  setMeta('name', 'description', description);
  setRobots(true);
  setCanonical(canonical);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', canonical);
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
}
