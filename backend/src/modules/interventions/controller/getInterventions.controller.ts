import type { Request, Response, NextFunction } from 'express';
import { GetInterventionsService } from '../services/getInterventions.service';

export class GetInterventionsController {
  constructor(private readonly getInterventionsService: GetInterventionsService) {}

  public getInterventions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        missionId: req.query.missionId as string | undefined,
        teamId: req.query.teamId as string | undefined,
        status: req.query.status as string | undefined,
      };

      const result = await this.getInterventionsService.getInterventions(query);

      res.status(200).json({
        success: true,
        message: 'Liste des interventions récupérée avec succès.',
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