const env = import.meta.env;

export const BROADCAST = {
  title: 'Real Estate vs Digital Estate',
  videoUrl: env.VITE_BROADCAST_VIDEO_URL || '',
  previewUrl: env.VITE_BROADCAST_PREVIEW_URL || '',
  posterUrl: env.VITE_BROADCAST_POSTER_URL || '',
  durationSec: Number(env.VITE_BROADCAST_DURATION_MIN || 75) * 60,
  startHour: 19,
};

export const OFFER_WINDOW_HOURS = 24;

export const ENDPOINTS = {
  leads: env.VITE_LEADS_ENDPOINT || '',
  catalog: env.VITE_CATALOG_ENDPOINT || '',
  checkout: env.VITE_CHECKOUT_ENDPOINT || '',
};

export const BANK = {
  accountName: env.VITE_BANK_ACCOUNT_NAME || 'Hibarri (Pty) Ltd',
  bankName: env.VITE_BANK_NAME || '',
  account: env.VITE_BANK_ACCOUNT || '',
  swift: env.VITE_BANK_SWIFT || '',
};

export const COMPANIES = [];
