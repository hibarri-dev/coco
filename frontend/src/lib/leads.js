import { ENDPOINTS } from '../config/funnel';
import { getAttribution } from './analytics';

/* Posts a form submission to the Superadmin > Marketing > Forms endpoint.
   Never blocks the visitor's flow if the request fails. */
export async function submitLead(form, data) {
  const payload = {
    form,
    data,
    page: window.location.pathname,
    referrer: document.referrer || null,
    submittedAt: new Date().toISOString(),
    ...getAttribution(),
  };

  if (!ENDPOINTS.leads) {
    if (import.meta.env.DEV) console.info('[leads] VITE_API_URL / VITE_LEADS_ENDPOINT not set, submission:', payload);
    return payload;
  }

  try {
    await fetch(ENDPOINTS.leads, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    /* network failure: visitor continues regardless */
  }
  return payload;
}
