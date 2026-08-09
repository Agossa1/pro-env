import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '../errors/appErrors';
import { logger } from '../../config/loggers/logger';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const payload = {
      status: 'error',
      message: 'Erreur de validation',
      errors: err.issues.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    };
    logger.error('Zod Validation Error:', payload.errors);
    return res.status(400).json(payload);
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      errors: err instanceof ValidationError ? err.errors : undefined,
    });
  }

  // Log unexpected errors
  logger.error('Unexpected Error', err);

  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
};