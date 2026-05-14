// ─── Sentry (client) — no-op when VITE_SENTRY_DSN is absent ──────────────────

import * as Sentry from '@sentry/react';

const dsn = import.meta.env['VITE_SENTRY_DSN'];

export const sentryEnabled = Boolean(dsn);

if (sentryEnabled) {
  Sentry.init({
    dsn,
    environment:       import.meta.env.MODE,
    tracesSampleRate:  Number(import.meta.env['VITE_SENTRY_TRACES_SAMPLE_RATE'] ?? '0.1'),
    sendDefaultPii:    false,
  });
}

export { Sentry };
