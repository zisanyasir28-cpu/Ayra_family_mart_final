/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer, { type Transporter } from 'nodemailer';

// ─── Lazy transporter ─────────────────────────────────────────────────────────

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env['SMTP_HOST'];
  const port = process.env['SMTP_PORT'];
  const user = process.env['SMTP_USER'];
  const pass = process.env['SMTP_PASS'];

  if (!host || !port || !user || !pass) return null;

  cachedTransporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });
  return cachedTransporter;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type EmailUser = { email: string; name: string };

type EmailOrderItem = {
  productName: string;
  quantity: number;
  totalPriceInPaisa: number;
};

type EmailOrder = {
  orderNumber: string;
  totalInPaisa: number;
  subtotalInPaisa: number;
  shippingInPaisa: number;
  discountInPaisa: number;
  paymentMethod: string;
  items: EmailOrderItem[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function paisa(p: number): string {
  return `৳${(p / 100).toFixed(2)}`;
}

async function send(subject: string, to: string, text: string, html: string): Promise<void> {
  const transporter = getTransporter();
  const from = process.env['SMTP_FROM'] ?? 'no-reply@ayrafamilymart.com';

  if (!transporter) {
    // eslint-disable-next-line no-console
    console.info('[email:dev]', subject, '→', to);
    return;
  }

  try {
    await transporter.sendMail({ from, to, subject, text, html });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[email] failed to send', subject, 'to', to, err);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function sendOrderConfirmation(order: EmailOrder, user: EmailUser): Promise<void> {
  const subject = `Order Confirmation — ${order.orderNumber}`;

  const itemLines = order.items
    .map((i) => `  • ${i.productName} × ${i.quantity} — ${paisa(i.totalPriceInPaisa)}`)
    .join('\n');

  const text = [
    `Hi ${user.name},`,
    ``,
    `Thanks for your order! We've received your order ${order.orderNumber}.`,
    ``,
    `Items:`,
    itemLines,
    ``,
    `Subtotal: ${paisa(order.subtotalInPaisa)}`,
    `Discount: -${paisa(order.discountInPaisa)}`,
    `Shipping: ${paisa(order.shippingInPaisa)}`,
    `Total:    ${paisa(order.totalInPaisa)}`,
    `Payment:  ${order.paymentMethod}`,
    ``,
    `We'll send another email once your order ships.`,
    `— Ayra Family Mart`,
  ].join('\n');

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #d97706;">Order Confirmation</h2>
      <p>Hi ${user.name},</p>
      <p>Thanks for your order! We've received your order <strong>${order.orderNumber}</strong>.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        ${order.items
          .map(
            (i) => `<tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${i.productName} × ${i.quantity}</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${paisa(i.totalPriceInPaisa)}</td>
            </tr>`,
          )
          .join('')}
      </table>
      <p>
        Subtotal: <strong>${paisa(order.subtotalInPaisa)}</strong><br/>
        Discount: <strong>-${paisa(order.discountInPaisa)}</strong><br/>
        Shipping: <strong>${paisa(order.shippingInPaisa)}</strong><br/>
        Total: <strong style="font-size: 1.1em;">${paisa(order.totalInPaisa)}</strong><br/>
        Payment: <strong>${order.paymentMethod}</strong>
      </p>
      <p style="color: #6b7280;">— Ayra Family Mart</p>
    </div>
  `;

  await send(subject, user.email, text, html);
}

export async function sendOrderStatusChange(
  order: { orderNumber: string },
  user: EmailUser,
  newStatus: string,
  note?: string,
): Promise<void> {
  const subject = `Order ${order.orderNumber} — Status Updated to ${newStatus}`;
  const text = [
    `Hi ${user.name},`,
    ``,
    `Your order ${order.orderNumber} is now: ${newStatus}.`,
    note ? `\nNote: ${note}` : '',
    ``,
    `— Ayra Family Mart`,
  ].join('\n');

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #d97706;">Order Update</h2>
      <p>Hi ${user.name},</p>
      <p>Your order <strong>${order.orderNumber}</strong> is now: <strong>${newStatus}</strong>.</p>
      ${note ? `<p style="color: #6b7280;">Note: ${note}</p>` : ''}
      <p style="color: #6b7280;">— Ayra Family Mart</p>
    </div>
  `;

  await send(subject, user.email, text, html);
}
