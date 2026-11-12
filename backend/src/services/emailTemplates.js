import { CocoEmailTemplate } from '../models/CocoEmailTemplate.js';
import { escapeHtml, layout } from './mailer.js';
import { orderLineItems, orderFacts } from '../lib/orderSummary.js';

/**
 * Lifecycle emails Coco sends to server owners. Body text is plain text: blank lines separate
 * paragraphs, {Placeholder} tokens are filled in, [label](url) becomes a link, bare https:// URLs
 * are linked, and a paragraph that is exactly {OrderDetails} becomes the order table.
 */
export const LIFECYCLE_EMAILS = {
  account_welcome: {
    label: 'Welcome (account created)',
    trigger: 'system',
    triggerDescription: 'Sent when someone creates a Coco account (Cloud Partner or developer).',
    placeholders: ['Name', 'DashboardUrl'],
    subject: 'Welcome to Coco by Hibarri',
    bodyText: `Dear {Name}

Welcome to Coco! Your account is ready.

Everything you do with Coco lives in your dashboard, so that is the best place to start.

[Go to your dashboard]({DashboardUrl})

If you have any questions, just reply to this email and our team will help.

Kind Regards,
The Coco Team at Hibarri
https://coco.hibarri.com`,
  },

  purchase_completed: {
    label: 'Purchase completed',
    trigger: 'system',
    triggerDescription: 'Sent when a server order is paid (Stripe or admin-confirmed wire).',
    placeholders: ['Name', 'DataCenter', 'OrderReference', 'OrderDetails', 'InvoiceUrl'],
    attachesInvoice: true,
    subject: 'Congratulations on your Coco server purchase',
    bodyText: `Dear {Name}

Congratulations on your purchase! Your server package has been scheduled for shipping and should arrive at {DataCenter} within the next 72 hours.

Once it arrives, the data center will connect power and network for us to configure the server with our hypervisor and link it to Coco Cloud.

In the meantime, you can log in to your dashboard and add your banking details. Payments occur once a month on the 28th of every month from Chase Bank, USA.

Your dashboard will not yet be configured to show server consumption until it has been set up, we will mail you once it is officially linked to the cloud.

Your order details were as follows, and you can [download your invoice]({InvoiceUrl}) from your dashboard at any time:

{OrderDetails}

Kind Regards,
The Coco Team at Hibarri
https://coco.hibarri.com`,
  },

  server_configuration: {
    label: 'Server arrived (Configuration stage)',
    trigger: 'admin',
    triggerDescription: 'Sent when an admin moves a server to the Configuration stage and assigns a rack number.',
    placeholders: ['Name', 'RackNumber', 'ServerName', 'Serial', 'DataCenter'],
    subject: 'Your server has arrived at the data center',
    bodyText: `Dear {Name}

Exciting news! Your server has arrived at the data center and is currently being configured! We will update you as soon as it is linked.

It has been allocated to Rack Number {RackNumber}.

Cloud capacity will start getting allocated to the server as soon as it is configured for metering.

Keep in mind that you may only start seeing serious user volumes in 3 weeks to 3 months from now as we will be gradually increasing capacity allocations over time.

We’ll be in touch soon!
The Coco Team`,
  },

  server_live: {
    label: 'Server live (Live stage)',
    trigger: 'admin',
    triggerDescription: 'Sent when an admin moves a server to the Live stage.',
    placeholders: ['Name', 'ServerName', 'Serial', 'DataCenter', 'RackNumber'],
    subject: 'Your server is live!',
    bodyText: `Dear {Name}

Your server is live!

You are officially renting out server capacity on the cloud. Metered use has started and you’ll be notified when your first compute load has been allocated.

Stay tuned.`,
  },

  first_use: {
    label: 'First user',
    trigger: 'system',
    triggerDescription: 'Sent the first time a customer workload is placed on the server.',
    placeholders: ['Name', 'DashboardUrl', 'ServerName', 'Serial', 'DataCenter'],
    subject: 'Your first user is here!',
    bodyText: `Dear {Name}

Exciting news - your server is hosting its first user for cloud computing! Check out your dashboard [HERE]({DashboardUrl}) to see what they’ve been up to! Your wallet will be credited at the end of the week.

Kind Regards
Coco Team`,
  },
};

export const LIFECYCLE_KEYS = Object.keys(LIFECYCLE_EMAILS);
export const isLifecycleKey = (key) => Object.hasOwn(LIFECYCLE_EMAILS, key);

const defaultBanner = () => process.env.EMAIL_BANNER_URL || '';
// Off by default: the MailLady SMTP server refuses file attachments until it runs the version that accepts them.
const attachInvoices = () => process.env.EMAIL_ATTACH_INVOICE === 'true';

/** Default copy merged with any admin override stored in the database. */
export async function resolveTemplate(key) {
  const def = LIFECYCLE_EMAILS[key];
  const override = await CocoEmailTemplate.findOne({ key }).lean();
  return {
    key,
    label: def.label,
    trigger: def.trigger,
    triggerDescription: def.triggerDescription,
    placeholders: def.placeholders,
    attachesInvoice: Boolean(def.attachesInvoice) && attachInvoices(),
    subject: override?.subject || def.subject,
    bodyText: override?.bodyText || def.bodyText,
    bannerUrl: override ? override.bannerUrl : defaultBanner(),
    enabled: override ? override.enabled : true,
    customized: Boolean(override && (override.subject || override.bodyText || override.bannerUrl !== defaultBanner() || !override.enabled)),
    updatedBy: override?.updatedBy || '',
    updatedAt: override?.updatedAt || null,
    defaults: { subject: def.subject, bodyText: def.bodyText, bannerUrl: defaultBanner() },
  };
}

const fill = (text, vars) =>
  String(text ?? '').replace(/\{([A-Za-z]+)\}/g, (token, name) => (vars[name] !== undefined && vars[name] !== null ? String(vars[name]) : token));

const linkStyle = 'color:#6a2bb8;font-weight:600';
const safeUrl = (url) => (/^https?:\/\/[^\s"'<>]+$/i.test(url) ? url : null);

// Links are found in the admin's template before values are substituted, so a customer's name can never inject one.
const LINK_PATTERN = /\[([^\]]+)\]\(([^\s)]+)\)|(https?:\/\/[^\s<]+)/g;

function paragraphHtml(raw, vars) {
  let out = '';
  let last = 0;
  for (const match of raw.matchAll(LINK_PATTERN)) {
    out += escapeHtml(fill(raw.slice(last, match.index), vars));
    const [whole, label, linkUrl, bareUrl] = match;
    const url = safeUrl(fill(linkUrl ?? bareUrl, vars));
    const text = escapeHtml(fill(label ?? bareUrl, vars));
    out += url ? `<a href="${escapeHtml(url)}" style="${linkStyle}">${label ? text : escapeHtml(url)}</a>` : escapeHtml(fill(whole, vars));
    last = match.index + whole.length;
  }
  out += escapeHtml(fill(raw.slice(last), vars));
  return out.replace(/\n/g, '<br>');
}

function paragraphText(raw, vars) {
  return fill(raw, vars).replace(/\[([^\]]+)\]\(([^\s)]+)\)/g, '$1 ($2)');
}

const cell = 'padding:8px 10px;border-bottom:1px solid #ece9f2;font-size:14px;color:#3b3946';

export function orderDetailsHtml(order) {
  if (!order) return '';
  const { lines, total } = orderLineItems(order);
  const facts = orderFacts(order)
    .map(([k, v]) => `<tr><td style="${cell};color:#8a8794;width:40%">${escapeHtml(k)}</td><td style="${cell}">${escapeHtml(v)}</td></tr>`)
    .join('');
  const items = lines
    .map(
      (l) =>
        `<tr><td style="${cell}">${escapeHtml(l.description)}${l.qty ? ` &times; ${escapeHtml(l.qty)}` : ''}</td><td style="${cell};text-align:right;white-space:nowrap">${escapeHtml(l.amount)}</td></tr>`
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;border-collapse:collapse">${facts}</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-collapse:collapse">${items}
<tr><td style="${cell};font-weight:700;border-bottom:0">Total</td><td style="${cell};font-weight:700;text-align:right;border-bottom:0">${escapeHtml(total)}</td></tr></table>`;
}

export function orderDetailsText(order) {
  if (!order) return '';
  const { lines, total } = orderLineItems(order);
  return [
    ...orderFacts(order).map(([k, v]) => `${k}: ${v}`),
    '',
    ...lines.map((l) => `${l.description}${l.qty ? ` x ${l.qty}` : ''}: ${l.amount}`),
    `Total: ${total}`,
  ].join('\n');
}

/**
 * Renders a template to { subject, html, text }. `vars` holds plain-text placeholder values;
 * `order` (optional) is used for {OrderDetails}.
 */
export function renderTemplate(template, vars = {}, { order } = {}) {
  const subject = fill(template.subject, vars).replace(/[\r\n]+/g, ' ').trim();
  const blocks = String(template.bodyText ?? '')
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const paragraphs = [];
  const text = [];
  for (const block of blocks) {
    if (block === '{OrderDetails}') {
      paragraphs.push({ html: orderDetailsHtml(order) });
      text.push(orderDetailsText(order));
    } else {
      paragraphs.push(paragraphHtml(block, vars));
      text.push(paragraphText(block, vars));
    }
  }

  const html = layout({ preheader: subject, heading: subject, paragraphs, bannerUrl: safeUrl(template.bannerUrl || '') });
  return { subject, html, text: text.join('\n\n') };
}

/** Values the admin preview and test sends use when there is no real order or server. */
export function sampleVars() {
  return {
    Name: 'Alex Morgan',
    DataCenter: 'Dedicated Datacenters Evocative DAL6, Dallas, TX',
    OrderReference: 'CC-SAMPLE1234',
    RackNumber: 'R-12',
    ServerName: 'Dell PowerEdge R7625',
    Serial: 'CC-SAMPLE1234-01',
    DashboardUrl: 'https://coco.hibarri.com/dashboard',
    InvoiceUrl: 'https://coco.hibarri.com/dashboard/billing',
  };
}

export function sampleOrder() {
  return {
    reference: 'CC-SAMPLE1234',
    currency: 'usd',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    dataCenter: { provider: 'Dedicated Datacenters', facility: 'Evocative DAL6', city: 'Dallas', region: 'TX' },
    model: { name: 'Dell PowerEdge R7625', cpu: '2x AMD EPYC 9354', ram: '768GB DDR5' },
    quote: { qty: 2, rackU: 4, unitPrice: 18500, serversSubtotal: 37000, discount: 740, rackTotal: 2400, total: 38660 },
    customer: { name: 'Alex Morgan', email: 'alex@example.com', company: 'Example LLC' },
    createdAt: new Date(),
    paidAt: new Date(),
  };
}
