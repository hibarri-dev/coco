import { ENDPOINTS } from '../config/funnel';

/* Asks /api/email to send a transactional email from coco@hibarri.com.
   Never blocks the visitor's flow if the request fails. */
export async function sendEmail(template, data) {
  try {
    const res = await fetch(ENDPOINTS.email, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template, ...data }),
      keepalive: true,
    });
    if (!res.ok && import.meta.env.DEV) console.info('[email] not sent:', res.status, await res.text().catch(() => ''));
    return res.ok;
  } catch {
    return false;
  }
}
