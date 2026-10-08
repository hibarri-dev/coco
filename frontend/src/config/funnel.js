// Also imported by the serverless functions in /api, where import.meta.env doesn't exist.
const env = import.meta.env ?? globalThis.process?.env ?? {};

// Hibarri API, e.g. https://api.hibarri.com/api. Superadmin > Coco reads everything sent here.
export const API_URL = (env.VITE_API_URL || 'https://api.hibarri.com/api').replace(/\/+$/, '');

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

export const ENDPOINTS = {
  leads: env.VITE_LEADS_ENDPOINT || (API_URL ? `${API_URL}/coco/leads` : ''),
  catalog: env.VITE_CATALOG_ENDPOINT || '',
  checkout: env.VITE_CHECKOUT_ENDPOINT || '/api/checkout',
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
