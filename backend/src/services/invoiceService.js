import PDFDocument from 'pdfkit';
import { orderLineItems, orderFacts } from '../lib/orderSummary.js';

const BRAND = '#6a2bb8';
const INK = '#3b3946';
const MUTED = '#8a8794';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '');

function seller() {
  return {
    name: process.env.INVOICE_SELLER_NAME || 'Hibarri (Pty) Ltd',
    address: (process.env.INVOICE_SELLER_ADDRESS || '').split('|').map((l) => l.trim()).filter(Boolean),
    email: process.env.INVOICE_SELLER_EMAIL || process.env.EMAIL_REPLY_TO || 'coco@hibarri.com',
    website: 'https://coco.hibarri.com',
  };
}

function bankDetails() {
  return [
    ['Account name', process.env.INVOICE_BANK_ACCOUNT_NAME || process.env.INVOICE_SELLER_NAME || 'Hibarri (Pty) Ltd'],
    ['Bank', process.env.INVOICE_BANK_NAME],
    ['Account / IBAN', process.env.INVOICE_BANK_ACCOUNT],
    ['SWIFT / BIC', process.env.INVOICE_BANK_SWIFT],
  ].filter(([, v]) => v);
}

export const invoiceFilename = (order) => `Invoice-${order.reference}.pdf`;

/** Builds the order invoice as a PDF Buffer. */
export function buildInvoicePdf(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50, info: { Title: `Invoice ${order.reference}`, Author: seller().name } });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const s = seller();
    const left = doc.page.margins.left;
    const width = doc.page.width - left - doc.page.margins.right;

    doc.rect(0, 0, doc.page.width, 90).fill(BRAND);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(20).text('CoCo by Hibarri', left, 32);
    doc.font('Helvetica').fontSize(10).text('coco.hibarri.com', left, 58);
    doc.font('Helvetica-Bold').fontSize(22).text('INVOICE', left, 34, { width, align: 'right' });

    doc.fillColor(INK).font('Helvetica-Bold').fontSize(11).text(s.name, left, 120);
    doc.font('Helvetica').fontSize(9).fillColor(MUTED);
    for (const line of [...s.address, s.email]) doc.text(line);

    const metaX = left + width / 2;
    const meta = [
      ['Invoice number', order.reference],
      ['Invoice date', fmtDate(order.paidAt || order.createdAt || new Date())],
      ['Order date', fmtDate(order.createdAt)],
    ];
    let y = 120;
    for (const [k, v] of meta) {
      doc.fillColor(MUTED).fontSize(9).text(k, metaX, y, { width: width / 4 });
      doc.fillColor(INK).text(v, metaX + width / 4, y, { width: width / 4, align: 'right' });
      y += 15;
    }

    y = Math.max(doc.y, y) + 25;
    const c = order.customer || {};
    doc.fillColor(MUTED).fontSize(9).text('BILL TO', left, y);
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(11).text(c.name || '', left, y + 14);
    doc.font('Helvetica').fontSize(9).fillColor(INK);
    for (const line of [c.company, c.email, c.phone].filter(Boolean)) doc.text(line);

    y = doc.y + 20;
    for (const [k, v] of orderFacts(order)) {
      doc.fillColor(MUTED).fontSize(9).text(k, left, y, { width: 130 });
      doc.fillColor(INK).text(String(v ?? ''), left + 130, y, { width: width - 130 });
      y = doc.y + 4;
    }

    y += 16;
    const cols = { desc: left, qty: left + width * 0.58, unit: left + width * 0.68, amount: left + width * 0.82 };
    doc.rect(left, y, width, 22).fill('#f5f3f9');
    doc.fillColor(MUTED).font('Helvetica-Bold').fontSize(9);
    doc.text('Description', cols.desc + 8, y + 7);
    doc.text('Qty', cols.qty, y + 7, { width: width * 0.1, align: 'right' });
    doc.text('Unit price', cols.unit, y + 7, { width: width * 0.14, align: 'right' });
    doc.text('Amount', cols.amount, y + 7, { width: width * 0.18 - 8, align: 'right' });
    y += 30;

    const { lines, total } = orderLineItems(order);
    doc.font('Helvetica').fillColor(INK).fontSize(10);
    for (const l of lines) {
      doc.text(l.description, cols.desc + 8, y, { width: width * 0.56 - 8 });
      const rowEnd = doc.y;
      doc.text(String(l.qty), cols.qty, y, { width: width * 0.1, align: 'right' });
      doc.text(l.unit, cols.unit, y, { width: width * 0.14, align: 'right' });
      doc.text(l.amount, cols.amount, y, { width: width * 0.18 - 8, align: 'right' });
      y = Math.max(rowEnd, doc.y) + 8;
      doc.moveTo(left, y - 4).lineTo(left + width, y - 4).strokeColor('#ece9f2').lineWidth(1).stroke();
    }

    y += 6;
    doc.font('Helvetica-Bold').fontSize(12).fillColor(INK);
    doc.text('Total', cols.unit, y, { width: width * 0.14, align: 'right' });
    doc.text(total, cols.amount, y, { width: width * 0.18 - 8, align: 'right' });
    y = doc.y + 6;
    doc.font('Helvetica').fontSize(9).fillColor(order.paymentStatus === 'paid' ? '#1f8a4c' : MUTED);
    doc.text(order.paymentStatus === 'paid' ? `PAID ${fmtDate(order.paidAt)}` : 'Payment due', cols.unit, y, { width: width * 0.32 - 8, align: 'right' });

    const bank = bankDetails();
    if (order.paymentStatus !== 'paid' && order.paymentMethod === 'wire' && bank.length) {
      y = doc.y + 30;
      doc.fillColor(INK).font('Helvetica-Bold').fontSize(10).text('Wire transfer details', left, y);
      doc.font('Helvetica').fontSize(9);
      for (const [k, v] of [...bank, ['Payment reference', order.reference]]) {
        doc.fillColor(MUTED).text(k, left, doc.y + 4, { continued: true, width: 130 }).fillColor(INK).text(`   ${v}`);
      }
    }

    doc
      .fillColor(MUTED)
      .fontSize(8)
      .text(
        `Thank you for your purchase. Questions about this invoice? Contact ${s.email}. ${s.website}`,
        left,
        doc.page.height - doc.page.margins.bottom - 20,
        { width, align: 'center', lineBreak: false }
      );

    doc.end();
  });
}
