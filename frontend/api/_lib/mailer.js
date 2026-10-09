import nodemailer from 'nodemailer';

let transport;

export function getMailer() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  const port = Number(process.env.SMTP_PORT || 465);
  transport ??= nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transport;
}

export const FROM = () => process.env.EMAIL_FROM || 'CoCo by Hibarri <coco@hibarri.com>';

export const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Table layout and inline styles only: most email clients ignore <style> blocks and flexbox.
export function layout({ preheader, heading, paragraphs, button, footnote }) {
  const body = paragraphs.map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3b3946">${p}</p>`).join('');
  const cta = button
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px"><tr><td style="border-radius:12px;background:#9e00ff">
        <a href="${escapeHtml(button.href)}" style="display:inline-block;padding:14px 26px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none">${escapeHtml(button.label)}</a>
      </td></tr></table>`
    : '';
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f5f3f9;font-family:Montserrat,'Segoe UI',Helvetica,Arial,sans-serif">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3f9;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden">
        <tr><td style="background:linear-gradient(115deg,#8b4fb3,#6a2bb8 40%,#3f1a9e);background-color:#6a2bb8;padding:28px 32px;color:#ffffff">
          <div style="font-size:13px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;opacity:0.8">CoCo by Hibarri</div>
          <div style="margin-top:10px;font-size:26px;font-weight:700;line-height:1.2">${escapeHtml(heading)}</div>
        </td></tr>
        <tr><td style="padding:28px 32px 8px">${body}${cta}</td></tr>
        <tr><td style="padding:0 32px 28px;font-size:12px;line-height:1.6;color:#8a8794">${footnote ?? ''}</td></tr>
      </table>
      <div style="margin-top:16px;font-size:11px;color:#a29fae">You received this because you signed up at coco.hibarri.com.</div>
    </td></tr>
  </table>
</body></html>`;
}
