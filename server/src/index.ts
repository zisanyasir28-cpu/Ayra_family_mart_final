import { resolve } from 'path';
import dotenv from 'dotenv';
// __dirname is server/src — go up one level to find server/.env
dotenv.config({ path: resolve(__dirname, '../.env') });

// ─── Sentry must be imported BEFORE anything else for proper instrumentation ─
import { Sentry, sentryEnabled } from './lib/sentry';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import responseTime from 'response-time';
import pinoHttp from 'pino-http';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — xss-clean has no published type definitions
import xss from 'xss-clean';

import { logger } from './lib/logger';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiters';
import apiRouter from './routes/index';

const app = express();
// If the process harness injects PORT=5173 (Vite's port), fall back to 5000
const _ENV_PORT = parseInt(process.env['PORT'] ?? '5000', 10);
const PORT = _ENV_PORT === 5173 ? 5000 : _ENV_PORT;

// ─── Allowed origins ─────────────────────────────────────────────────────────
// In production, only CLIENT_URL + ADMIN_URL are allowed. In dev, also accept
// the Vite default port to keep the local DX smooth.
const allowedOrigins: string[] = [
  process.env['CLIENT_URL'],
  process.env['ADMIN_URL'],
  ...(process.env['NODE_ENV'] !== 'production' ? ['http://localhost:5173'] : []),
].filter((u): u is string => !!u);

// ─── Performance ─────────────────────────────────────────────────────────────
app.set('etag', 'strong');                       // Strong ETags for JSON responses
app.use(responseTime());                          // X-Response-Time header
app.use(compression({ threshold: 1024 }));        // gzip/br compression

// ─── Security headers (Helmet) ───────────────────────────────────────────────
//
// Explicit config so the policy is auditable. Key directives:
//  • CSP: only own origin + Cloudinary for images
//  • frameguard DENY: no embedding (clickjacking protection)
//  • HSTS 1 year + includeSubDomains + preload (prod TLS only)
//  • Referrer same-origin (don't leak our paths to third parties)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc:    ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com'],
        scriptSrc: ["'self'"],
        styleSrc:  ["'self'", "'unsafe-inline'"],   // Tailwind injects inline styles
        connectSrc:["'self'", ...allowedOrigins, 'https://*.sentry.io'],
        fontSrc:   ["'self'", 'data:'],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri:   ["'self'"],
        formAction: ["'self'"],
      },
    },
    frameguard:     { action: 'deny' },
    hsts:           { maxAge: 31_536_000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: 'same-origin' },
    crossOriginEmbedderPolicy: false,            // allows Cloudinary images
  }),
);

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow no-origin requests (curl, server-to-server, Postman)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS: origin "${origin}" not allowed`));
    },
    credentials:    true,
    methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ─── Global rate limiter ─────────────────────────────────────────────────────
app.use(generalLimiter);

// ─── Body parsers ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ─── Sanitization (defense-in-depth) ─────────────────────────────────────────
// • Express 5 made `req.query` read-only. xss-clean and mongo-sanitize both
//   attempt to *replace* it (their implementations predate Express 5), which
//   crashes with "Cannot set property query of #<IncomingMessage>". This shim
//   shadows the getter with a writable copy on each request so the legacy
//   middlewares can mutate it safely.
app.use((req, _res, next) => {
  Object.defineProperty(req, 'query', {
    ...Object.getOwnPropertyDescriptor(req, 'query'),
    value:        { ...req.query },
    writable:     true,
    configurable: true,
    enumerable:   true,
  });
  next();
});

// • mongoSanitize: no-op for our Postgres + Prisma stack but kept for
//   defense-in-depth in case middleware order ever introduces a NoSQL leak.
// • xss: legacy package — Helmet CSP is the primary XSS defense, this is
//   belt-and-suspenders for query/body string fields.
// • hpp: blocks HTTP Parameter Pollution (e.g. ?role=ADMIN&role=CUSTOMER).
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// ─── Logging ─────────────────────────────────────────────────────────────────
if (process.env['NODE_ENV'] !== 'test') {
  app.use(
    pinoHttp({
      logger,
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
      // Don't log full request bodies — they may contain secrets
      serializers: {
        req: (req) => ({ method: req.method, url: req.url, id: req.id }),
        res: (res) => ({ statusCode: res.statusCode }),
      },
    }),
  );
}

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/v1', apiRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' },
  });
});

// ─── Sentry error handler (must run BEFORE our errorHandler) ─────────────────
if (sentryEnabled) {
  Sentry.setupExpressErrorHandler(app);
}

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────────────────────
if (process.env['NODE_ENV'] !== 'test') {
  app.listen(PORT, () => {
    logger.info(
      {
        port:        PORT,
        environment: process.env['NODE_ENV'] ?? 'development',
        sentry:      sentryEnabled,
      },
      'Server started',
    );
  });
}

export { app };
