import type { Request, Response, NextFunction } from 'express';
import { GetMissionsService } from '../services/getMissions.service';

export class GetMissionsController {
  constructor(private readonly getMissionsService: GetMissionsService) {}

  public getMissions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        territoryId: req.query.territoryId as string | undefined,
        status: req.query.status as string | undefined,
        missionType: req.query.missionType as string | undefined,
        organizationId: req.query.organizationId as string | undefined,
      };

      const result = await this.getMissionsService.getMissions(query);

      res.status(200).json({
        success: true,
        message: 'Liste des missions récupérée avec succès.',
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