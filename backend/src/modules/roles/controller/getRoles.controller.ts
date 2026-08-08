import type { Request, Response, NextFunction } from 'express';
import { GetRolesService } from '../services/getRoles.service';
import type { PaginationQuery } from '../types/role.types';

export class GetRolesController {
  constructor(private readonly getRolesService: GetRolesService) {}

  public getRoles = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query: PaginationQuery = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      };

      const result = await this.getRolesService.getRoles(query);

      res.status(200).json({
        success: true,
        message: 'Liste des rôles récupérée avec succès.',
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}