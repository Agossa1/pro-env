import type { Request, Response, NextFunction } from 'express';
import { GetUsersService } from '../services/getUsers.service';
import { getScopeFilters } from '../../../shared/helpers/scopeFilters.helper';

export class GetUsersController {
  constructor(private readonly getUsersService: GetUsersService) {}

  public getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const filters = getScopeFilters(req);
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        filters,
      };

      const result = await this.getUsersService.getUsers(query);

      res.status(200).json({
        success: true,
        message: 'Liste des utilisateurs récupérée avec succès.',
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