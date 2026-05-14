import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';

// ─── GET /admin/metrics ──────────────────────────────────────────────────────
//
// Lightweight runtime telemetry for the ops dashboard.
//  • uptime / node version / memory
//  • redis: connected or not (no ping latency to avoid noise)
//  • database: ok or error
//  • timestamp
//
// Cached internally for 2 seconds so external monitors hitting this every
// second don't slam Redis + Postgres.

let cached: { ts: number; payload: unknown } | null = null;

export const adminMetrics = asyncHandler(async (_req: Request, res: Response) => {
  if (cached && Date.now() - cached.ts < 2_000) {
    return sendSuccess(res, cached.payload);
  }

  const mem = process.memoryUsage();

  const [redisOk, dbOk] = await Promise.all([
    redis.ping().then((r) => r === 'PONG').catch(() => false),
    prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
  ]);

  const payload = {
    uptimeSeconds: Math.round(process.uptime()),
    node:          process.version,
    pid:           process.pid,
    memory: {
      rssMB:       Math.round(mem.rss       / 1024 / 1024),
      heapUsedMB:  Math.round(mem.heapUsed  / 1024 / 1024),
      heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
      externalMB:  Math.round(mem.external  / 1024 / 1024),
    },
    redis:    { connected: redisOk },
    database: { status: dbOk ? 'ok' : 'error' },
    timestamp: new Date().toISOString(),
  };

  cached = { ts: Date.now(), payload };
  return sendSuccess(res, payload);
});
