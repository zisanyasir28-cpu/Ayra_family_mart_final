import { randomBytes } from 'crypto';

// Crockford base32 (no 0/O/1/I/L confusion) — 32 chars
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/**
 * Generate a unique-ish order number: `ORD-YYYYMMDD-XXXXXX`.
 * Uniqueness is verified inside the order-create transaction; the controller
 * retries on collision.
 */
export function generateOrderNumber(): string {
  const now    = new Date();
  const yyyy   = now.getUTCFullYear();
  const mm     = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd     = String(now.getUTCDate()).padStart(2, '0');

  const bytes = randomBytes(6);
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    const byte = bytes[i] ?? 0;
    suffix += ALPHABET[byte % ALPHABET.length];
  }

  return `ORD-${yyyy}${mm}${dd}-${suffix}`;
}
