import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';

export const validate = (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({ body: req.body, params: req.params, query: req.query });
    next();
  } catch (error: any) {
    if (error instanceof ZodError) {
      const formattedErrors = error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message
      }));

      res.status(400).json({ error: 'Validation error', details: formattedErrors });
      return;
    }

    res.status(400).json({ error: 'Validation error' });
  }
};
