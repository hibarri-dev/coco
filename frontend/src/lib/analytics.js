import { API_URL } from '../config/funnel';

/* First-party analytics for Superadmin > Coco > Dashboard. Events are batched and posted as
   text/plain so neither fetch nor sendBeacon needs a CORS preflight. */

const ENDPOINT = API_URL ? `${API_URL}/coco/analytics/collect` : '';
const VISITOR_KEY = 'coco_vid';
const SESSION_KEY = 'coco_sid';
const ATTRIBUTION_KEY = 'coco_attr';
const IDLE_MS = 30 * 60 * 1000;
const FLUSH_MS = 10_000;
const HEARTBEAT_MS = 15_000;
const MAX_BATCH = 60;

let queue = [];
let inFlight = false;
let started = false;
let currentPath = null;
let activeSince = null;
let lastView = { path: null, at: 0 };

function store(kind) {
  try {
    return window[kind];
  } catch {
    return null;
  }
}

function readJson(kind, key) {
  try {
    return JSON.parse(store(kind)?.getItem(key) || 'null');
  } catch {
    return null;
  }
}

function writeJson(kind, key, value) {
  try {
    store(kind)?.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

function randomId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID().replace(/-/g, '');
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

function visitorId() {
  const ls = store('localStorage');
  let id = null;
  try {
    id = ls?.getItem(VISITOR_KEY);
    if (!id) {
      id = randomId();
      ls?.setItem(VISITOR_KEY, id);
    }
  } catch {
    id = id || randomId();
  }
  return id;
}

/* A session ends after 30 idle minutes, like Galileo's tracker. */
function ensureSession() {
  const now = Date.now();
  const saved = readJson('sessionStorage', SESSION_KEY);
  const isNew = !saved?.id || now - saved.at > IDLE_MS;
  const id = isNew ? randomId() : saved.id;
  writeJson('sessionStorage', SESSION_KEY, { id, at: now });
  return { id, isNew };
}

function attribution() {
  const { id } = ensureSession();
  let saved = readJson('sessionStorage', ATTRIBUTION_KEY);
  if (!saved || saved.sid !== id) {
    const params = new URLSearchParams(window.location.search);
    saved = {
      sid: id,
      referrer: document.referrer || '',
      landingPage: window.location.pathname,
      utmSource: params.get('utm_source') || '',
      utmMedium: params.get('utm_medium') || '',
      utmCampaign: params.get('utm_campaign') || '',
    };
    writeJson('sessionStorage', ATTRIBUTION_KEY, saved);
  }
  return saved;
}

/* Who this visitor is and where the session came from; attached to form submissions. */
export function getAttribution() {
  if (typeof window === 'undefined') return {};
  const a = attribution();
  return {
    visitorId: visitorId(),
    sessionId: a.sid,
    firstReferrer: a.referrer,
    landingPage: a.landingPage,
    utmSource: a.utmSource,
    utmMedium: a.utmMedium,
    utmCampaign: a.utmCampaign,
  };
}

export function track(type, props = {}) {
  if (!ENDPOINT) {
    if (import.meta.env.DEV) console.debug('[analytics]', type, props);
    return;
  }
  queue.push({ type, ...props });
  if (queue.length >= MAX_BATCH) flush();
}

export function flush({ beacon = false } = {}) {
  if (!ENDPOINT || !queue.length) return;
  if (inFlight && !beacon) return;
  const events = queue.splice(0, MAX_BATCH);
  const a = getAttribution();
  const body = JSON.stringify({
    sessionId: a.sessionId,
    visitorId: a.visitorId,
    referrer: a.firstReferrer,
    landingPage: a.landingPage,
    utmSource: a.utmSource,
    utmMedium: a.utmMedium,
    utmCampaign: a.utmCampaign,
    language: navigator.language || '',
    events,
  });

  if (beacon && navigator.sendBeacon) {
    try {
      if (navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'text/plain;charset=UTF-8' }))) return;
    } catch {
      /* fall through to fetch */
    }
  }
  inFlight = true;
  fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body,
    keepalive: true,
    credentials: 'omit',
  })
    .catch(() => {})
    .finally(() => {
      inFlight = false;
    });
}

/* Active time only counts while the tab is visible; the sub-second remainder carries over. */
function commitActive() {
  if (activeSince === null || !currentPath) return;
  const sec = Math.floor((Date.now() - activeSince) / 1000);
  if (sec <= 0) return;
  activeSince += sec * 1000;
  track('heartbeat', { path: currentPath, sec: Math.min(sec, 120) });
}

export function trackPageView(path) {
  const now = Date.now();
  // StrictMode runs effects twice in development.
  if (lastView.path === path && now - lastView.at < 1000) return;
  lastView = { path, at: now };
  commitActive();
  currentPath = path;
  activeSince = document.visibilityState === 'visible' ? now : null;
  track('page_view', { path });
  flush();
}

export function startAnalytics() {
  if (started || typeof window === 'undefined' || !ENDPOINT) return;
  started = true;

  setInterval(() => {
    if (document.visibilityState === 'visible') commitActive();
  }, HEARTBEAT_MS);
  setInterval(() => flush(), FLUSH_MS);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      commitActive();
      activeSince = null;
      flush({ beacon: true });
      return;
    }
    if (ensureSession().isNew && currentPath) track('page_view', { path: currentPath });
    activeSince = Date.now();
  });
  window.addEventListener('pagehide', () => {
    commitActive();
    flush({ beacon: true });
  });
}
