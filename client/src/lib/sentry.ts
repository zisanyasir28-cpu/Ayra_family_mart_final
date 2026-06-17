// ─── Sentry (client) — lazily loaded, build-time gated ───────────────────────
// @sentry/react does nothing unless VITE_SENTRY_DSN is set. We gate the dynamic
// import on that env literal: when it's unset (the default / "stubbed" state),
// Vite inlines `undefined`, the early-return becomes unconditional, and the
// bundler dead-code-eliminates the import — so Sentry ships in NO chunk at all.
// When a DSN is configured, the named import lets it tree-shake to what we use.

let capture: ((error: unknown) => void) | null = null;

export const sentryEnabled = Boolean(import.meta.env['VITE_SENTRY_DSN']);

/**
 * Dynamically import + initialise Sentry. No-op (and fully tree-shaken away)
 * unless VITE_SENTRY_DSN is set at build time. Call once at startup.
 */
export async function initSentry(): Promise<void> {
  const dsn = import.meta.env['VITE_SENTRY_DSN'];
  if (!dsn) return;
  const { init, captureException: sentryCapture } = await import('@sentry/react');
  init({
    dsn,
    environment:       import.meta.env.MODE,
    tracesSampleRate:  Number(import.meta.env['VITE_SENTRY_TRACES_SAMPLE_RATE'] ?? '0.1'),
    sendDefaultPii:    false,
  });
  capture = sentryCapture;
}

/** Report an error to Sentry if it's loaded; a no-op otherwise. */
export function captureException(error: unknown): void {
  capture?.(error);
}
