import { CocoEmailTemplate } from '../models/CocoEmailTemplate.js';
import { EmailLog, EMAIL_LOG_STATUSES } from '../models/EmailLog.js';
import { LIFECYCLE_KEYS, isLifecycleKey, resolveTemplate, renderTemplate, sampleVars, sampleOrder } from '../services/emailTemplates.js';
import { buildInvoicePdf, invoiceFilename } from '../services/invoiceService.js';
import { getMailer, FROM } from '../services/mailer.js';
import { str, EMAIL } from '../lib/http.js';

const MAX_BODY = 10_000;

function keyOr404(req, res) {
  const key = str(req.params.key, 60);
  if (isLifecycleKey(key)) return key;
  res.status(404).json({ error: 'not_found', message: 'Unknown email template' });
  return null;
}

// Hibarri proxy actors arrive as "hibarri:<email>".
const actorEmail = (user) => String(user?.email || '').replace(/^hibarri:/, '');

/** Unsaved edits from the admin editor, laid over the stored template. */
function draft(template, body = {}) {
  return {
    ...template,
    subject: typeof body.subject === 'string' && body.subject.trim() ? str(body.subject, 300) : template.subject,
    bodyText: typeof body.bodyText === 'string' && body.bodyText.trim() ? String(body.bodyText).slice(0, MAX_BODY) : template.bodyText,
    bannerUrl: typeof body.bannerUrl === 'string' ? str(body.bannerUrl, 1000) : template.bannerUrl,
  };
}

export async function listEmailTemplates(req, res) {
  const templates = await Promise.all(LIFECYCLE_KEYS.map(resolveTemplate));
  return res.json({ success: true, templates });
}

export async function updateEmailTemplate(req, res) {
  const key = keyOr404(req, res);
  if (!key) return;
  const body = req.body ?? {};
  const errors = [];
  const $set = { updatedBy: actorEmail(req.user) };

  if (body.subject !== undefined) {
    if (typeof body.subject !== 'string' || !body.subject.trim()) errors.push('subject cannot be empty');
    else $set.subject = str(body.subject, 300);
  }
  if (body.bodyText !== undefined) {
    if (typeof body.bodyText !== 'string' || !body.bodyText.trim()) errors.push('bodyText cannot be empty');
    else if (body.bodyText.length > MAX_BODY) errors.push(`bodyText must be under ${MAX_BODY} characters`);
    else $set.bodyText = body.bodyText.replace(/\r\n/g, '\n');
  }
  if (body.bannerUrl !== undefined) {
    const url = str(body.bannerUrl, 1000);
    if (url && !/^https:\/\/[^\s"'<>]+$/i.test(url)) errors.push('bannerUrl must be an https:// image URL');
    else $set.bannerUrl = url;
  }
  if (body.enabled !== undefined) {
    if (typeof body.enabled !== 'boolean') errors.push('enabled must be true or false');
    else $set.enabled = body.enabled;
  }
  if (errors.length) return res.status(400).json({ error: 'invalid_fields', message: errors.join('; ') });

  const current = await resolveTemplate(key);
  // Copy identical to the default is stored empty, so later changes to the default still apply.
  if ($set.subject === current.defaults.subject) $set.subject = '';
  if ($set.bodyText === current.defaults.bodyText) $set.bodyText = '';
  await CocoEmailTemplate.updateOne(
    { key },
    { $set, $setOnInsert: { key, ...('bannerUrl' in $set ? {} : { bannerUrl: current.bannerUrl }), ...('enabled' in $set ? {} : { enabled: current.enabled }) } },
    { upsert: true }
  );
  return res.json({ success: true, template: await resolveTemplate(key) });
}

export async function resetEmailTemplate(req, res) {
  const key = keyOr404(req, res);
  if (!key) return;
  await CocoEmailTemplate.deleteOne({ key });
  return res.json({ success: true, template: await resolveTemplate(key) });
}

export async function previewEmailTemplate(req, res) {
  const key = keyOr404(req, res);
  if (!key) return;
  const template = draft(await resolveTemplate(key), req.body);
  const rendered = renderTemplate(template, sampleVars(), { order: sampleOrder() });
  return res.json({ success: true, ...rendered, attachesInvoice: template.attachesInvoice });
}

export async function sendTestEmail(req, res) {
  const key = keyOr404(req, res);
  if (!key) return;
  const to = str(req.body?.to, 254).toLowerCase() || actorEmail(req.user);
  if (!EMAIL.test(to)) return res.status(400).json({ error: 'invalid_email', message: 'Send a valid "to" address for the test email' });
  const mailer = getMailer();
  if (!mailer) return res.status(503).json({ error: 'smtp_not_configured', message: 'SMTP is not configured on the Coco backend' });

  const template = draft(await resolveTemplate(key), req.body);
  const order = sampleOrder();
  const { subject, html, text } = renderTemplate(template, sampleVars(), { order });
  const attachments = template.attachesInvoice
    ? [{ filename: invoiceFilename(order), content: await buildInvoicePdf(order), contentType: 'application/pdf' }]
    : undefined;
  try {
    await mailer.sendMail({ from: FROM(), to, subject: `[TEST] ${subject}`, html, text, attachments });
  } catch (err) {
    return res.status(502).json({ error: 'send_failed', message: `The mail server refused the test email: ${String(err?.response || err?.message || err).slice(0, 300)}` });
  }
  return res.json({ success: true, to });
}

export async function listEmailLogs(req, res) {
  const filter = {};
  const key = str(req.query.key, 60);
  const status = str(req.query.status, 20);
  if (isLifecycleKey(key)) filter.key = key;
  if (EMAIL_LOG_STATUSES.includes(status)) filter.status = status;
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
  const logs = await EmailLog.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  return res.json({
    success: true,
    count: logs.length,
    logs: logs.map((l) => ({ id: l._id, key: l.key, refId: l.refId, to: l.to, status: l.status, error: l.error, trigger: l.trigger, sentAt: l.sentAt, createdAt: l.createdAt })),
  });
}
