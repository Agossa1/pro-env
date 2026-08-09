import type { Request, Response, NextFunction } from 'express';
import { GetTerritoryTypesService } from '../services/getTerritoryTypes.service';
import type { PaginationQuery } from '../types/territory.types';

export class GetTerritoryTypesController {
  constructor(private readonly getTerritoryTypesService: GetTerritoryTypesService) {}

  public getTerritoryTypes = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query: PaginationQuery = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      };

      const result = await this.getTerritoryTypesService.getTerritoryTypes(query);

      res.status(200).json({
        success: true,
        message: 'Liste des types de territoires récupérée avec succès.',
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