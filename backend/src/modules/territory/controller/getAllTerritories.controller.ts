import type { Request, Response, NextFunction } from 'express';
import { GetAllTerritoriesService, GetAllTerritoriesQuery } from '../services/getAllTerritories.service';

export class GetAllTerritoriesController {
  constructor(
    private readonly getAllTerritoriesService: GetAllTerritoriesService
  ) {}

  public getAllTerritories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query: GetAllTerritoriesQuery = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        territoryTypeId: req.query.territoryTypeId as string | undefined,
        parentTerritoryId: req.query.parentTerritoryId as string | undefined,
      };

      const result = await this.getAllTerritoriesService.getAllTerritories(query);

      res.status(200).json({
        success: true,
        message: 'Liste des territoires récupérée avec succès.',
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