/** Posts a server-side lead to Hibarri (Superadmin > Coco > Forms, and from there to MailLady). Never throws. */
export async function forwardLead(form, data) {
  const endpoint = process.env.LEADS_ENDPOINT;
  if (!endpoint || !/^https?:\/\//.test(endpoint)) return;
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ form, data, submittedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    console.error(`[Leads] Could not forward ${form}:`, err?.message);
  }
}
