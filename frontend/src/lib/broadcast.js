import { useEffect, useState } from 'react';
import { BROADCAST, OFFER_WINDOW_HOURS } from '../config/funnel';

const REG_KEY = 'coco-broadcast';
const OFFER_KEY = 'coco-offer-deadline';

function startOf(date, dayOffset = 0) {
  const d = new Date(date);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(BROADCAST.startHour, 0, 0, 0);
  return d;
}

const sessionId = (start) =>
  `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;

/* Sessions start every day at BROADCAST.startHour in the visitor's own time zone. */
export function getSchedule(now = new Date(), durationSec = BROADCAST.durationSec) {
  const durMs = durationSec * 1000;
  for (const offset of [-1, 0]) {
    const start = startOf(now, offset);
    if (now >= start && now < start.getTime() + durMs) {
      return { status: 'live', start, position: (now - start) / 1000, duration: durationSec, id: sessionId(start) };
    }
  }
  const today = startOf(now);
  const next = now < today ? today : startOf(now, 1);
  return { status: 'upcoming', start: next, msUntil: next - now, duration: durationSec, id: sessionId(next) };
}

export function useNow(interval = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(t);
  }, [interval]);
  return now;
}

export function formatClock(date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function timeZoneLabel(date = new Date()) {
  try {
    return new Intl.DateTimeFormat([], { timeZoneName: 'short' }).formatToParts(date).find((p) => p.type === 'timeZoneName')?.value ?? '';
  } catch {
    return '';
  }
}

export function dayLabel(start, now = new Date()) {
  const a = new Date(start).setHours(0, 0, 0, 0);
  const b = new Date(now).setHours(0, 0, 0, 0);
  const diff = Math.round((a - b) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return new Date(start).toLocaleDateString([], { weekday: 'long' });
}

export function splitDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

export function getRegistration() {
  return read(REG_KEY);
}

export function saveRegistration(lead) {
  write(REG_KEY, { ...getRegistration(), lead, registeredAt: new Date().toISOString() });
}

export function markCompleted(session) {
  write(REG_KEY, { ...getRegistration(), completedAt: new Date().toISOString(), completedSession: session });
}

export function getOfferDeadline() {
  const stored = read(OFFER_KEY);
  if (stored && !Number.isNaN(Date.parse(stored))) return new Date(stored);
  const deadline = new Date(Date.now() + OFFER_WINDOW_HOURS * 3600 * 1000);
  write(OFFER_KEY, deadline.toISOString());
  return deadline;
}

export function calendarFile(start, url) {
  const stamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const end = new Date(start.getTime() + BROADCAST.durationSec * 1000);
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CoCo by Hibarri//Broadcast//EN',
    'BEGIN:VEVENT',
    `UID:${stamp(start)}@coco.hibarri.com`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${BROADCAST.title} (CoCo broadcast)`,
    `DESCRIPTION:Join here: ${url}`,
    `URL:${url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
