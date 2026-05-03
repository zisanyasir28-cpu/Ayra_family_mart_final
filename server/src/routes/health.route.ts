import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const checks: Record<string, 'ok' | 'error'> = {
    server: 'ok',
    database: 'error',
    redis: 'error',
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks['database'] = 'ok';
  } catch {
    // database unreachable — already marked error
  }

  try {
    await redis.ping();
    checks['redis'] = 'ok';
  } catch {
    // redis unreachable — already marked error
  }

  const isHealthy = Object.values(checks).every((v) => v === 'ok');
  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    data: { status: isHealthy ? 'healthy' : 'degraded', checks },
  });
});

export default router;
