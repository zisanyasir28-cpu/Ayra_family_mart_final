import { randomBytes } from 'crypto';

// TODO(payment-phase): replace this stub with the real SSLCommerz REST integration.
// Docs: https://developer.sslcommerz.com/doc/

export interface InitiatePaymentInput {
  orderId:       string;
  orderNumber:   string;
  amountInPaisa: number;
  customer: {
    name:  string;
    email: string;
    phone: string;
  };
}

export interface InitiatePaymentResult {
  gatewayUrl: string;
  sessionKey: string;
}

export async function initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
  const clientUrl  = process.env['CLIENT_URL'] ?? 'http://localhost:5173';
  const sessionKey = `mock-${randomBytes(12).toString('hex')}`;

  return {
    gatewayUrl: `${clientUrl}/payment/mock?orderId=${input.orderId}&session=${sessionKey}`,
    sessionKey,
  };
}
