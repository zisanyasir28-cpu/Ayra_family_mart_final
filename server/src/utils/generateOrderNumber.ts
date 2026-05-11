import { randomBytes } from 'node:crypto';

/**
 * Generates a human-readable order number in the format `ORD-YYYYMMDD-XXXXXX`.
 *
 * - Date prefix scopes randomness to a single day, keeping the suffix short.
 * - Suffix is a 6-char Crockford base32 string (no I, L, O, U) for legibility.
 * - Caller is responsible for retrying on collisions inside the same `$transaction`.
 *   Collision odds within one day at our scale are vanishingly small but not zero.
 */
export function generateOrderNumber(now: Date = new Date()): string {
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');

  // Crockford base32 alphabet — excludes I, L, O, U to avoid look-alikes.
  const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  const bytes = randomBytes(6);
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    const byte = bytes[i] ?? 0;
    suffix += ALPHABET[byte % ALPHABET.length];
  }

  return `ORD-${yyyy}${mm}${dd}-${suffix}`;
}
