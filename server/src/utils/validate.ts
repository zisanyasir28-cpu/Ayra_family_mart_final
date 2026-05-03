import type { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from './ApiError';

type RequestPart = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, part: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      const details = (result.error as ZodError).errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));
      return next(ApiError.badRequest('Validation failed', details));
    }
    // Express 5 makes req.query a read-only getter — use Object.assign to mutate
    // in-place rather than replacing the reference. For body/params, direct assignment works.
    if (part === 'query') {
      Object.assign(req.query, result.data);
    } else {
      req[part] = result.data as typeof req[typeof part];
    }
    next();
  };
}
