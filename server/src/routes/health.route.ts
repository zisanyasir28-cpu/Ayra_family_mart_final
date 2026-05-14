import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

const router = Router();

interface HealthChecks {
  server:   'ok';
  database: 'ok' | 'error';
  redis:    'ok' | 'error';
}

// Avoid hammering DB on aggressive health-checkers — cache last result for 5s
let cached: { ts: number; body: unknown; status: number } | null = null;

router.get('/', async (_req: Request, res: Response) => {
  if (cached && Date.now() - cached.ts < 5_000) {
    return res.status(cached.status).json(cached.body);
  }

  const checks: HealthChecks = { server: 'ok', database: 'error', redis: 'error' };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    // database unreachable — already marked error
  }

  try {
    const pingResult = await redis.ping();
    checks.redis = pingResult === 'PONG' ? 'ok' : 'error';
  } catch {
    // redis unreachable — already marked error
  }

  const allOk  = checks.database === 'ok' && checks.redis === 'ok';
  const status = allOk ? 200 : 503;

  const body = {
    success: allOk,
    data: {
      status:    allOk ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version:   process.env['npm_package_version'] ?? '0.0.0',
      uptime:    Math.round(process.uptime()),
      checks,
    },
  };

  cached = { ts: Date.now(), body, status };
  return res.status(status).json(body);
});

export default router;
