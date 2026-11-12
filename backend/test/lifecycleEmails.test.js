import { test, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import { renderTemplate, LIFECYCLE_EMAILS, sampleOrder, sampleVars } from '../src/services/emailTemplates.js';
import { buildInvoicePdf } from '../src/services/invoiceService.js';
import { EmailLog } from '../src/models/EmailLog.js';
import { CocoEmailTemplate } from '../src/models/CocoEmailTemplate.js';
import { User } from '../src/models/User.js';
import { Server } from '../src/models/Server.js';
import { Service } from '../src/models/Service.js';
import { sendLifecycleEmail, notifySignup } from '../src/services/notificationService.js';
import { syncAllocation } from '../src/services/placementService.js';

const lean = (value) => ({ lean: async () => value });
const tick = () => new Promise((r) => setTimeout(r, 20));

const sent = [];
process.env.SMTP_HOST = 'smtp.test';
process.env.SMTP_USER = 'user';
process.env.SMTP_PASS = 'pass';
mock.method(nodemailer, 'createTransport', () => ({ sendMail: async (msg) => sent.push(msg) }));

/** In-memory EmailLog with the same unique (key, refId) rule as the real index. */
function fakeEmailLog() {
  const rows = new Map();
  const id = (key, refId) => `${key}|${refId}`;
  mock.method(EmailLog, 'create', async (doc) => {
    if (rows.has(id(doc.key, doc.refId))) throw Object.assign(new Error('dup'), { code: 11000 });
    rows.set(id(doc.key, doc.refId), { ...doc });
  });
  mock.method(EmailLog, 'updateOne', async (filter, { $set }) => Object.assign(rows.get(id(filter.key, filter.refId)), $set));
  mock.method(EmailLog, 'findOneAndUpdate', async (filter, { $set }) => {
    const row = rows.get(id(filter.key, filter.refId));
    if (!row || row.status !== filter.status) return null;
    return Object.assign(row, $set);
  });
  return rows;
}

beforeEach(() => {
  sent.length = 0;
  mock.method(CocoEmailTemplate, 'findOne', () => lean(null));
});

test('placeholders are filled, HTML-escaped, and unknown ones are left visible', () => {
  const { subject, html, text } = renderTemplate(
    { subject: 'Hi {Name}', bodyText: 'Dear {Name}\n\nRack {RackNumber}, {Unknown}.' },
    { Name: '<b>Ada</b> & co', RackNumber: 'R-7' }
  );
  assert.equal(subject, 'Hi <b>Ada</b> & co');
  assert.match(html, /Dear &lt;b&gt;Ada&lt;\/b&gt; &amp; co/);
  assert.match(html, /Rack R-7, \{Unknown\}\./);
  assert.match(text, /Dear <b>Ada<\/b> & co/);
});

test('links come only from the template, never from customer values', () => {
  const { html } = renderTemplate(
    { subject: 's', bodyText: 'See [HERE]({DashboardUrl}) or https://coco.hibarri.com\n\nHi {Name}' },
    { DashboardUrl: 'https://coco.hibarri.com/dashboard', Name: '[click](https://evil.example)' }
  );
  assert.match(html, /<a href="https:\/\/coco\.hibarri\.com\/dashboard"[^>]*>HERE<\/a>/);
  assert.match(html, /<a href="https:\/\/coco\.hibarri\.com"/);
  assert.doesNotMatch(html, /href="https:\/\/evil/);
});

test('non-http link targets and banner URLs are dropped', () => {
  const { html } = renderTemplate({ subject: 's', bodyText: '[x](javascript:alert(1))', bannerUrl: 'javascript:alert(1)' }, {});
  assert.doesNotMatch(html, /href="javascript/);
  assert.doesNotMatch(html, /<img/);
  const withBanner = renderTemplate({ subject: 's', bodyText: 'b', bannerUrl: 'https://cdn.example/banner.png' }, {});
  assert.match(withBanner.html, /<img src="https:\/\/cdn\.example\/banner\.png"/);
});

test('{OrderDetails} renders the order table in the purchase email', () => {
  const def = LIFECYCLE_EMAILS.purchase_completed;
  const { html, text } = renderTemplate(def, sampleVars(), { order: sampleOrder() });
  assert.match(html, /CC-SAMPLE1234/);
  assert.match(html, /\$38,660\.00/);
  assert.match(html, /Volume discount/);
  assert.match(text, /Total: \$38,660\.00/);
  assert.doesNotMatch(html, /\{OrderDetails\}/);
});

test('every default template renders with sample data and no leftover placeholders', () => {
  for (const [key, def] of Object.entries(LIFECYCLE_EMAILS)) {
    const { html } = renderTemplate(def, sampleVars(), { order: sampleOrder() });
    assert.doesNotMatch(html, /\{[A-Za-z]+\}/, `${key} left a placeholder unfilled`);
  }
});

test('invoice PDF is generated', async () => {
  const pdf = await buildInvoicePdf({ ...sampleOrder(), paymentMethod: 'wire', paymentStatus: 'awaiting' });
  assert.ok(Buffer.isBuffer(pdf));
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  assert.ok(pdf.length > 1000);
});

test('a lifecycle email is sent at most once per order/server', async () => {
  fakeEmailLog();
  mock.method(User, 'findById', () => lean({ name: 'Ada', email: 'ada@example.com' }));
  const server = { serial: 'CC-TEST1234-01', name: 'R7625', rackNumber: 'R-3', userId: new mongoose.Types.ObjectId(), dataCenterDetails: { city: 'Dallas' } };

  assert.equal(await sendLifecycleEmail('server_configuration', { server }), 'sent');
  assert.equal(await sendLifecycleEmail('server_configuration', { server }), 'duplicate');
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'ada@example.com');
  assert.match(sent[0].html, /Rack Number R-3/);

  assert.equal(await sendLifecycleEmail('server_live', { server }), 'sent');
  assert.equal(sent.length, 2);
});

test('the welcome email is sent once per account and links to the right dashboard', async () => {
  fakeEmailLog();
  const developer = { _id: new mongoose.Types.ObjectId(), name: 'Dev', email: 'dev@example.com', role: 'user' };
  const partner = { _id: new mongoose.Types.ObjectId(), name: 'Pat', email: 'pat@example.com', role: 'investor' };

  assert.equal(await notifySignup(developer), 'sent');
  assert.equal(await notifySignup(developer), 'duplicate');
  assert.equal(await notifySignup(partner), 'sent');
  assert.equal(sent.length, 2);
  assert.equal(sent[0].to, 'dev@example.com');
  assert.match(sent[0].html, /href="[^"]*\/dev"/);
  assert.match(sent[1].html, /href="[^"]*\/dashboard"/);
});

test('the purchase email attaches the invoice PDF', async () => {
  fakeEmailLog();
  const order = { ...sampleOrder(), reference: 'CC-PURCH0001' };
  assert.equal(await sendLifecycleEmail('purchase_completed', { order }), 'sent');
  assert.equal(sent[0].attachments?.[0]?.filename, 'Invoice-CC-PURCH0001.pdf');
  assert.equal(sent[0].attachments[0].content.subarray(0, 5).toString(), '%PDF-');
});

test('a disabled template is skipped and logged', async () => {
  const rows = fakeEmailLog();
  mock.method(CocoEmailTemplate, 'findOne', () => lean({ key: 'server_live', enabled: false, bannerUrl: '' }));
  mock.method(User, 'findById', () => lean({ name: 'Ada', email: 'ada@example.com' }));
  assert.equal(await sendLifecycleEmail('server_live', { server: { serial: 'CC-TEST1234-02', userId: 'x' } }), 'skipped');
  assert.equal(sent.length, 0);
  assert.equal(rows.get('server_live|CC-TEST1234-02').status, 'skipped');
});

test('first_use fires only when a server goes from 0 to 1+ customers', async () => {
  fakeEmailLog();
  mock.method(User, 'findById', () => lean({ name: 'Ada', email: 'ada@example.com' }));
  const fresh = new mongoose.Types.ObjectId();
  const busy = new mongoose.Types.ObjectId();
  const owner = new mongoose.Types.ObjectId();
  const servers = new Map([
    [String(fresh), { _id: fresh, serial: 'CC-FRESH001-01', customers: 0, firstUseAt: null, userId: owner }],
    [String(busy), { _id: busy, serial: 'CC-BUSY0001-01', customers: 2, firstUseAt: null, userId: owner }],
  ]);

  mock.method(Service, 'aggregate', async () => [
    { _id: fresh, vcpu: 4, ramGb: 8, owners: [owner] },
    { _id: busy, vcpu: 8, ramGb: 16, owners: [owner, new mongoose.Types.ObjectId()] },
  ]);
  mock.method(Server, 'find', (filter) => {
    const ids = filter._id.$in.map(String);
    return lean([...servers.values()].filter((s) => ids.includes(String(s._id)) && (filter.customers ? s.customers > 0 : true) && (filter.firstUseAt === null ? !s.firstUseAt : true)));
  });
  mock.method(Server, 'bulkWrite', async (ops) => {
    for (const { updateOne } of ops) Object.assign(servers.get(String(updateOne.filter._id)), updateOne.update.$set);
  });
  mock.method(Server, 'findOneAndUpdate', (filter, { $set }) => {
    const s = servers.get(String(filter._id));
    if (s.firstUseAt) return lean(null);
    Object.assign(s, $set);
    return lean({ ...s });
  });

  await syncAllocation([fresh, busy]);
  await tick();
  assert.equal(sent.length, 1);
  assert.match(sent[0].subject, /first user/i);
  assert.ok(servers.get(String(fresh)).firstUseAt);
  assert.equal(servers.get(String(busy)).firstUseAt, null);

  await syncAllocation([fresh, busy]);
  await tick();
  assert.equal(sent.length, 1);
});
