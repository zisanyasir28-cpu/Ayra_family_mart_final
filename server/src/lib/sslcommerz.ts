import { logger } from './logger';

// ─── Endpoints ────────────────────────────────────────────────────────────────

const SANDBOX_INIT_URL = 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';
const LIVE_INIT_URL    = 'https://securepay.sslcommerz.com/gwprocess/v4/api.php';
const SANDBOX_VAL_URL  = 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php';
const LIVE_VAL_URL     = 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php';

function isLive(): boolean {
  return process.env['SSLCOMMERZ_IS_LIVE'] === 'true';
}

function getInitUrl(): string {
  return isLive() ? LIVE_INIT_URL : SANDBOX_INIT_URL;
}

function getValidationUrl(): string {
  return isLive() ? LIVE_VAL_URL : SANDBOX_VAL_URL;
}

// ─── initiatePayment ─────────────────────────────────────────────────────────

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

export async function initiatePayment(
  input: InitiatePaymentInput,
): Promise<InitiatePaymentResult> {
  const storeId    = process.env['SSLCOMMERZ_STORE_ID']   ?? '';
  const storePass  = process.env['SSLCOMMERZ_STORE_PASS'] ?? '';
  const backendUrl = process.env['BACKEND_URL'] ??
    `http://localhost:${process.env['PORT'] ?? '5000'}`;

  const amountBdt = (input.amountInPaisa / 100).toFixed(2);

  const params = new URLSearchParams({
    store_id:         storeId,
    store_passwd:     storePass,
    total_amount:     amountBdt,
    currency:         'BDT',
    tran_id:          input.orderId,   // our orderId — used to look up order on IPN
    success_url:      `${backendUrl}/api/v1/payment/success`,
    fail_url:         `${backendUrl}/api/v1/payment/fail`,
    cancel_url:       `${backendUrl}/api/v1/payment/cancel`,
    ipn_url:          `${backendUrl}/api/v1/payment/ipn`,
    cus_name:         input.customer.name,
    cus_email:        input.customer.email,
    cus_phone:        input.customer.phone || '01700000000',
    cus_add1:         'Bangladesh',
    cus_city:         'Dhaka',
    cus_country:      'Bangladesh',
    shipping_method:  'NO',
    num_of_item:      '1',
    product_name:     input.orderNumber,
    product_category: 'Groceries',
    product_profile:  'general',
  });

  const response = await fetch(getInitUrl(), {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    params.toString(),
  });

  if (!response.ok) {
    logger.error({ status: response.status, orderId: input.orderId }, 'sslcommerz.http_error');
    throw new Error(`SSLCommerz request failed: HTTP ${response.status}`);
  }

  const data = (await response.json()) as Record<string, unknown>;

  logger.debug({ status: data['status'], orderId: input.orderId }, 'sslcommerz.init_response');

  if (data['status'] !== 'SUCCESS') {
    logger.error({ data, orderId: input.orderId }, 'sslcommerz.init_failed');
    throw new Error(
      `SSLCommerz initiation failed: ${String(data['failedreason'] ?? 'Unknown')}`,
    );
  }

  return {
    gatewayUrl: data['GatewayPageURL'] as string,
    sessionKey: data['sessionkey'] as string,
  };
}

// ─── validateIpn ─────────────────────────────────────────────────────────────

export interface IpnValidationResult {
  valid:         boolean;
  status:        string;
  transactionId: string;
  amount:        string;
  currency:      string;
}

export async function validateIpn(valId: string): Promise<IpnValidationResult> {
  const storeId   = process.env['SSLCOMMERZ_STORE_ID']   ?? '';
  const storePass = process.env['SSLCOMMERZ_STORE_PASS'] ?? '';

  const url = new URL(getValidationUrl());
  url.searchParams.set('val_id',       valId);
  url.searchParams.set('store_id',     storeId);
  url.searchParams.set('store_passwd', storePass);
  url.searchParams.set('format',       'json');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`SSLCommerz validation failed: HTTP ${response.status}`);
  }

  const data = (await response.json()) as Record<string, unknown>;
  const status = String(data['status'] ?? '');

  return {
    valid:         status === 'VALID' || status === 'VALIDATED',
    status,
    transactionId: String(data['bank_tran_id'] ?? ''),
    amount:        String(data['amount']        ?? '0'),
    currency:      String(data['currency']      ?? 'BDT'),
  };
}
