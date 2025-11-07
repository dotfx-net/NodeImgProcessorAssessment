import { Request, Response, NextFunction } from 'express';
import { env } from '@/core/infrastructure/config/env';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  const status = err.status || err.statusCode || 500;
  const isDev = env.NODE_ENV === 'development';

  if (status >= 500) {
    console.error('Server Error:', {
      status,
      message: err.message,
      stack: isDev ? err.stack : undefined,
      path: req.path,
      method: req.method,
      body: req.body
    });
  }

  let message: string;

  if (!isDev && status >= 500) {
    message = 'Internal Server Error';
  } else {
    message = err.message || 'Internal Server Error';
  }

  res.status(status).json({
    error: message,
    ...(isDev ? { stack: err.stack } : {}) // stack trace only in dev
  });
}
