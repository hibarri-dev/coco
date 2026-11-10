const env = import.meta.env;

// Hibarri API (analytics, leads, CMS pages, funnel videos), called cross-origin without cookies.
// Superadmin > Coco reads everything sent here. Accounts/dashboard/checkout use the Coco backend via
// same-origin /api instead (see middleware.js). VITE_API_URL is the old name, still read for existing deployments.
export const API_URL = (env.VITE_HIBARRI_API_URL || env.VITE_API_URL || 'https://api.hibarri.com/api').replace(/\/+$/, '');

// Media fields are replaced at startup by the active videos from Superadmin > Coco > Videos (lib/funnelMedia.js).
export const BROADCAST = {
  title: 'Real Estate vs Digital Estate',
  videoUrl: env.VITE_BROADCAST_VIDEO_URL || '',
  videoId: env.VITE_BROADCAST_VIDEO_URL ? 'env' : '',
  previewUrl: env.VITE_BROADCAST_PREVIEW_URL || '',
  posterUrl: env.VITE_BROADCAST_POSTER_URL || '',
  durationSec: Number(env.VITE_BROADCAST_DURATION_MIN || 75) * 60,
  startHour: 19,
  whitepaperUrl: env.VITE_WHITEPAPER_URL || encodeURI('/Whitepaper on Compute - Coco by Hibarri.pdf'),
};

export const OFFER_WINDOW_HOURS = 24;

// Investor/partner promos on the developer site (home, navbar, footer). The /investors pages stay live either way.
export const SHOW_INVESTORS = false;

export const ENDPOINTS = {
  leads: env.VITE_LEADS_ENDPOINT || (API_URL ? `${API_URL}/coco/leads` : ''),
  catalog: env.VITE_CATALOG_ENDPOINT || '',
  // Same-origin so the session cookie is sent; Vercel middleware and the Vite dev proxy forward /api to the backend.
  checkout: '/api/checkout',
  email: '/api/email',
};

export const BANK = {
  accountName: env.VITE_BANK_ACCOUNT_NAME || 'Hibarri (Pty) Ltd',
  bankName: env.VITE_BANK_NAME || '',
  account: env.VITE_BANK_ACCOUNT || '',
  swift: env.VITE_BANK_SWIFT || '',
};

export const COMPANIES = [];

// Drop official logo files into /public/press/ and set `logo`; the styled wordmark shows until then.
export const PRESS = [
  { name: 'Forbes', logo: '', wordmark: 'font-serif text-[1.35em] font-bold tracking-tight' },
  { name: 'Engineering News', logo: '', wordmark: 'font-sans text-[0.95em] font-extrabold uppercase tracking-tight' },
  { name: 'Mail & Guardian', logo: '', wordmark: 'font-serif text-[1.1em] font-bold italic' },
];
