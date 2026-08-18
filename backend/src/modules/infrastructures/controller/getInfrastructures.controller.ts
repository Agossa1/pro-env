import type { Request, Response, NextFunction } from 'express';
import { GetInfrastructuresService } from '../services/getInfrastructures.service';

export class GetInfrastructuresController {
  constructor(private readonly getInfrastructuresService: GetInfrastructuresService) {}

  public getInfrastructures = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        territoryId: req.query.territoryId as string | undefined,
        type: req.query.type as string | undefined,
        status: req.query.status as string | undefined,
        condition: req.query.condition as string | undefined,
        search: req.query.search as string | undefined,
      };

      const result = await this.getInfrastructuresService.getInfrastructures(query);

      res.status(200).json({
        success: true,
        message: 'Liste des infrastructures récupérée avec succès.',
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
