import { json } from './_lib/stripe.js';
import { getMailer, FROM, escapeHtml, layout } from './_lib/mailer.js';
import { BROADCAST } from '../src/config/funnel.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
// Best effort only: serverless instances don't share memory, but this stops a single client hammering one instance.
const recent = new Map();

const clip = (value, max = 80) => String(value ?? '').trim().slice(0, max);

function limited(ip) {
  if (!ip) return false;
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > MAX_PER_WINDOW;
}

function validTimeZone(tz) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return tz;
  } catch {
    return 'UTC';
  }
}

function icsFile(start, url) {
  const stamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const end = new Date(start.getTime() + BROADCAST.durationSec * 1000);
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CoCo by Hibarri//Broadcast//EN',
    'METHOD:PUBLISH',
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

function broadcastEmail({ firstName, start, timeZone, origin }) {
  const when = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
    timeZoneName: 'short',
  }).format(start);
  const room = `${origin}/live/room`;
  const whitepaper = new URL(BROADCAST.whitepaperUrl, origin).toString();
  return {
    subject: `Your seat is reserved: ${BROADCAST.title}`,
    html: layout({
      preheader: `${BROADCAST.title} starts ${when}.`,
      heading: `You're in, ${firstName}!`,
      paragraphs: [
        `Your free seat for <b>${escapeHtml(BROADCAST.title)}</b> is reserved.`,
        `<b>When:</b> ${escapeHtml(when)}`,
        'Learn about superintelligence, compute, data centers and servers, and how to get your share of the $1.1 trillion cloud landlord economy.',
        `While you wait, read our free <a href="${escapeHtml(whitepaper)}" style="color:#9e00ff;font-weight:600">White Paper on Compute</a>.`,
      ],
      button: { href: room, label: 'Go to the broadcast room' },
      footnote: 'Open the room link on the device you registered with. A calendar invite is attached so you don\'t miss the start.',
    }),
    text: `You're in, ${firstName}!\n\nYour free seat for ${BROADCAST.title} is reserved.\nWhen: ${when}\n\nBroadcast room: ${room}\nWhite Paper on Compute: ${whitepaper}\n`,
    attachments: [{ filename: 'coco-broadcast.ics', content: icsFile(start, room), contentType: 'text/calendar; charset=utf-8; method=PUBLISH' }],
  };
}

function whitepaperEmail({ firstName, origin }) {
  const whitepaper = new URL(BROADCAST.whitepaperUrl, origin).toString();
  return {
    subject: 'Your White Paper on Compute',
    html: layout({
      preheader: 'Compute, superintelligence and where investment is going.',
      heading: `Here's your white paper, ${firstName}`,
      paragraphs: [
        'Thanks for your interest in CoCo. Our White Paper on Compute covers why superintelligence runs on compute, how data centers and servers earn, and how private owners take part in the cloud landlord economy.',
        `When you're ready, you can <a href="${escapeHtml(`${origin}/investors#packages`)}" style="color:#9e00ff;font-weight:600">browse server packages</a> or join our free daily <a href="${escapeHtml(`${origin}/live`)}" style="color:#9e00ff;font-weight:600">${escapeHtml(BROADCAST.title)}</a> broadcast.`,
      ],
      button: { href: whitepaper, label: 'Read the white paper' },
      footnote: 'Questions? Just reply to this email and a partner specialist will get back to you.',
    }),
    text: `Here's your white paper, ${firstName}\n\nDownload: ${whitepaper}\n\nServer packages: ${origin}/investors#packages\n`,
  };
}

export async function POST(request) {
  const mailer = getMailer();
  if (!mailer) return json({ error: 'not_configured' }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const email = clip(body?.email, 200).toLowerCase();
  if (!EMAIL.test(email)) return json({ error: 'invalid_email' }, 400);
  if (limited(request.headers.get('x-forwarded-for')?.split(',')[0]?.trim())) return json({ error: 'rate_limited' }, 429);

  const firstName = clip(body.name).split(/\s+/)[0] || 'there';
  const origin = process.env.SITE_URL || new URL(request.url).origin;

  let message;
  if (body.template === 'broadcast-registration') {
    const start = new Date(body.start);
    const offset = start.getTime() - Date.now();
    // Sessions run daily, so a valid start is never far from now.
    if (Number.isNaN(offset) || offset < -3 * 3600_000 || offset > 50 * 3600_000) return json({ error: 'invalid_start' }, 400);
    message = broadcastEmail({ firstName, start, timeZone: validTimeZone(clip(body.timeZone, 64)), origin });
  } else if (body.template === 'whitepaper') {
    message = whitepaperEmail({ firstName, origin });
  } else {
    return json({ error: 'invalid_template' }, 400);
  }

  try {
    await mailer.sendMail({ from: FROM(), to: email, replyTo: process.env.EMAIL_REPLY_TO || undefined, ...message });
    return json({ sent: true });
  } catch (err) {
    console.error('[email] send failed', err?.code, err?.message);
    return json({ error: 'send_failed' }, 502);
  }
}
