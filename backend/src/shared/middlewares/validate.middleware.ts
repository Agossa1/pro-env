import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { ZodObject } from 'zod';

export const validateRequest = (schema: ZodObject<any>) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // error.middlewares.ts attrape cette erreur
        next(error);
      } else {
        next(error);
      }
    }
  };
