import nodemailer, { type Transporter } from 'nodemailer';

/**
 * Lazy SMTP transporter. We don't want to fail server boot when SMTP env is
 * missing (dev/test), so when the env is incomplete we fall back to a
 * console-logging stub. Real integration uses Gmail SMTP (or any provider).
 */
let cachedTransporter: Transporter | null = null;
let cachedReady = false;

interface EmailEnv {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

function readEnv(): EmailEnv | null {
  const host = process.env['SMTP_HOST'];
  const port = process.env['SMTP_PORT'];
  const user = process.env['SMTP_USER'];
  const pass = process.env['SMTP_PASS'];
  const from = process.env['EMAIL_FROM'] ?? user;

  if (!host || !port || !user || !pass || !from) return null;
  return { host, port: Number(port), user, pass, from };
}

function getTransporter(): { transporter: Transporter | null; from: string | null } {
  if (cachedReady) return { transporter: cachedTransporter, from: cachedFrom };
  cachedReady = true;

  const env = readEnv();
  if (!env) {
    cachedTransporter = null;
    cachedFrom = null;
    return { transporter: null, from: null };
  }

  cachedTransporter = nodemailer.createTransport({
    host: env.host,
    port: env.port,
    secure: env.port === 465,
    auth: { user: env.user, pass: env.pass },
  });
  cachedFrom = env.from;
  return { transporter: cachedTransporter, from: cachedFrom };
}

let cachedFrom: string | null = null;

interface SendOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Sends an email. In dev/test (no SMTP env) it logs and resolves successfully so
 * callers don't need to branch. Production failures are caught by the caller.
 */
export async function sendEmail(opts: SendOptions): Promise<void> {
  const { transporter, from } = getTransporter();
  if (!transporter || !from) {
    console.info('[email:dev]', opts.subject, '→', opts.to);
    return;
  }
  await transporter.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    ...(opts.html && { html: opts.html }),
  });
}

// ─── Templates ────────────────────────────────────────────────────────────────

interface OrderForEmail {
  orderNumber: string;
  totalInPaisa: number;
  paymentMethod: string;
  status: string;
  items: Array<{ productName: string; quantity: number; totalPriceInPaisa: number }>;
}

interface UserForEmail {
  email: string;
  name: string;
}

function fmt(paisa: number): string {
  return `BDT ${(paisa / 100).toFixed(2)}`;
}

export async function sendOrderConfirmation(
  order: OrderForEmail,
  user: UserForEmail,
): Promise<void> {
  const itemLines = order.items
    .map((i) => `  - ${i.productName} × ${i.quantity}  ${fmt(i.totalPriceInPaisa)}`)
    .join('\n');

  const text = [
    `Hi ${user.name},`,
    '',
    `Thank you for your order! We've received order ${order.orderNumber}.`,
    '',
    'Items:',
    itemLines,
    '',
    `Total: ${fmt(order.totalInPaisa)}`,
    `Payment: ${order.paymentMethod}`,
    '',
    'You can track this order from your account at any time.',
    '',
    '— Ayra Family Mart',
  ].join('\n');

  await sendEmail({
    to: user.email,
    subject: `Order ${order.orderNumber} confirmed`,
    text,
  });
}

export async function sendOrderStatusChange(
  order: OrderForEmail,
  user: UserForEmail,
  newStatus: string,
  note?: string,
): Promise<void> {
  const text = [
    `Hi ${user.name},`,
    '',
    `Your order ${order.orderNumber} is now: ${newStatus}.`,
    note ? `Note: ${note}` : '',
    '',
    '— Ayra Family Mart',
  ]
    .filter(Boolean)
    .join('\n');

  await sendEmail({
    to: user.email,
    subject: `Order ${order.orderNumber} — ${newStatus}`,
    text,
  });
}
