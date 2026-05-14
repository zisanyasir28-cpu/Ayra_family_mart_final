// ─── Sentry (error tracking) ──────────────────────────────────────────────────
//
// Initializes Sentry if SENTRY_DSN is set. Without it, all functions are
// no-ops so production code paths never branch on env availability.
//
// IMPORTANT: this module MUST be imported *first* in index.ts (before any
// other instrumentation), per Sentry's documented startup order.

import * as Sentry from '@sentry/node';

const dsn = process.env['SENTRY_DSN'];
export const sentryEnabled = Boolean(dsn);

if (sentryEnabled) {
  Sentry.init({
    dsn,
    environment:      process.env['NODE_ENV'] ?? 'development',
    tracesSampleRate: Number(process.env['SENTRY_TRACES_SAMPLE_RATE'] ?? '0.1'),
    integrations: [
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
    ],
    // Don't send PII by default
    sendDefaultPii: false,
  });
}

export { Sentry };
