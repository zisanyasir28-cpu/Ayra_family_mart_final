import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';
import type { ApiErrorResponse } from '@superstore/shared';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // ZodError — shouldn't normally reach here (validate middleware handles it first)
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    const body: ApiErrorResponse = {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details },
    };
    res.status(400).json(body);
    return;
  }

  // Operational API errors
  if (err instanceof ApiError) {
    const body: ApiErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined && { details: err.details }),
      },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  // Unknown / programmer errors — log and return generic 500
  console.error('[Unhandled Error]', err);

  const body: ApiErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env['NODE_ENV'] === 'production'
        ? 'An unexpected error occurred'
        : String(err),
    },
  };
  res.status(500).json(body);
}
