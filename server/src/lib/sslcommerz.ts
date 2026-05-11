import { randomBytes } from 'node:crypto';

/**
 * SSLCommerz payment-gateway stub.
 *
 * TODO(payment-phase): replace this with a real SSLCommerz integration —
 * call SSLCommerzNodejs.init(), validate IPN responses against the configured
 * store credentials, and persist `gatewayResponse` on the Payment row.
 *
 * For now we return a deterministic mock URL that the frontend can navigate
 * to in dev/test. The mock URL points back at the client at /payment/mock so
 * the customer journey is testable end-to-end without a real gateway.
 */

interface InitiatePaymentInput {
  orderId: string;
  orderNumber: string;
  amountInPaisa: number;
  customer: {
    name: string;
    email: string;
    phone: string | null;
  };
}

export interface InitiatePaymentResult {
  gatewayUrl: string;
  sessionKey: string;
}

export async function initiatePayment(
  input: InitiatePaymentInput,
): Promise<InitiatePaymentResult> {
  const clientUrl = process.env['CLIENT_URL'] ?? 'http://localhost:5173';
  const sessionKey = `mock-${randomBytes(8).toString('hex')}`;

  // In a real integration we'd POST to SSLCommerz here and use their session URL.
  // For the mock, we route the user through our own /payment/mock page.
  const gatewayUrl = `${clientUrl}/payment/mock?orderId=${encodeURIComponent(
    input.orderId,
  )}&orderNumber=${encodeURIComponent(input.orderNumber)}&session=${sessionKey}`;

  return { gatewayUrl, sessionKey };
}
