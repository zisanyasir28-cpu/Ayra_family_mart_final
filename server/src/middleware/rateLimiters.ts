import { rateLimit } from 'express-rate-limit';

// ─── Standard error body matches our ApiError shape ───────────────────────────

function makeMessage(message: string) {
  return {
    success: false,
    error:   { code: 'TOO_MANY_REQUESTS', message },
  };
}

// Skip rate limiting entirely in tests — test suites rapid-fire requests
// and would otherwise immediately exhaust the bucket.
const skipInTest = (): boolean => process.env['NODE_ENV'] === 'test';

// ─── General — applied globally ───────────────────────────────────────────────

export const generalLimiter = rateLimit({
  windowMs:        15 * 60_000, // 15 minutes
  max:             500,
  standardHeaders: 'draft-7',
  legacyHeaders:   false,
  skip:            skipInTest,
  message:         makeMessage('Too many requests, please try again later.'),
});

// ─── Auth — login / register / forgot / reset password ───────────────────────

export const authLimiter = rateLimit({
  windowMs:        15 * 60_000,
  max:             20,
  standardHeaders: 'draft-7',
  legacyHeaders:   false,
  skip:            skipInTest,
  message:         makeMessage('Too many auth attempts. Please wait 15 minutes.'),
});

// ─── Order — create / cancel ─────────────────────────────────────────────────

export const orderLimiter = rateLimit({
  windowMs:        60_000, // 1 minute
  max:             10,
  standardHeaders: 'draft-7',
  legacyHeaders:   false,
  skip:            skipInTest,
  message:         makeMessage('Too many order operations. Please slow down.'),
});

// ─── Search — products list / autocomplete ───────────────────────────────────

export const searchLimiter = rateLimit({
  windowMs:        60_000,
  max:             60,
  standardHeaders: 'draft-7',
  legacyHeaders:   false,
  skip:            skipInTest,
  message:         makeMessage('Search rate limit exceeded.'),
});

// ─── Review — submit ─────────────────────────────────────────────────────────

export const reviewLimiter = rateLimit({
  windowMs:        60 * 60_000, // 1 hour
  max:             20,
  standardHeaders: 'draft-7',
  legacyHeaders:   false,
  skip:            skipInTest,
  message:         makeMessage('Too many reviews submitted. Please try again later.'),
});
