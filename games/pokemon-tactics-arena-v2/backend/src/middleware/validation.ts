import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger';

export interface ValidationSchemas {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}

/**
 * Middleware de validation des données avec Zod
 */
export const validateRequest = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validation du body
      if (schemas.body) {
        const bodyResult = schemas.body.safeParse(req.body);
        if (!bodyResult.success) {
          res.status(400).json({
            success: false,
            error: 'Invalid request body',
            details: bodyResult.error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          });
          return;
        }
        req.body = bodyResult.data;
      }

      // Validation des query parameters
      if (schemas.query) {
        const queryResult = schemas.query.safeParse(req.query);
        if (!queryResult.success) {
          res.status(400).json({
            success: false,
            error: 'Invalid query parameters',
            details: queryResult.error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          });
          return;
        }
        req.query = queryResult.data;
      }

      // Validation des paramètres d'URL
      if (schemas.params) {
        const paramsResult = schemas.params.safeParse(req.params);
        if (!paramsResult.success) {
          res.status(400).json({
            success: false,
            error: 'Invalid URL parameters',
            details: paramsResult.error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          });
          return;
        }
        req.params = paramsResult.data;
      }

      next();
    } catch (error) {
      logger.error('Validation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
};

/**
 * Middleware de validation rapide pour les IDs
 */
export const validateId = (paramName: string = 'id') => {
  const schema = z.object({
    [paramName]: z.string().uuid('Invalid ID format')
  });

  return validateRequest({ params: schema });
};

/**
 * Middleware de validation pour la pagination
 */
export const validatePagination = () => {
  const schema = z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? Math.min(parseInt(val, 10), 100) : 20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
  });

  return validateRequest({ query: schema });
};