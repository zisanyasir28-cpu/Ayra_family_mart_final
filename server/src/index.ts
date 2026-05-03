import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';

import { errorHandler } from './middleware/errorHandler';
import apiRouter from './routes/index';

const app = express();
const PORT = process.env['PORT'] ?? 5000;

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: process.env['CLIENT_URL'] ?? 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Global rate limiter (generous — individual endpoint limiters are stricter)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      success: false,
      error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests, please try again later' },
    },
  }),
);

// ─── Parsers ─────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ─── Logging ─────────────────────────────────────────────────────────────────
if (process.env['NODE_ENV'] !== 'test') {
  app.use(morgan(process.env['NODE_ENV'] === 'production' ? 'combined' : 'dev'));
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

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────────────────────
if (process.env['NODE_ENV'] !== 'test') {
  app.listen(PORT, () => {
    console.log(`[server] Running on http://localhost:${PORT}/api/v1`);
    console.log(`[server] Environment: ${process.env['NODE_ENV'] ?? 'development'}`);
  });
}

export { app };
