import { ENDPOINTS } from '../config/funnel';

/* Posts a form submission to the Superadmin > Marketing > Forms endpoint.
   Never blocks the visitor's flow if the request fails. */
export async function submitLead(form, data) {
  const payload = {
    form,
    data,
    page: window.location.pathname,
    referrer: document.referrer || null,
    submittedAt: new Date().toISOString(),
  };

  if (!ENDPOINTS.leads) {
    if (import.meta.env.DEV) console.info('[leads] VITE_LEADS_ENDPOINT not set, submission:', payload);
    return payload;
  }

  try {
    await fetch(ENDPOINTS.leads, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    /* network failure: visitor continues regardless */
  }
  return payload;
}
