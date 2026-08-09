import type { Request, Response, NextFunction } from 'express';
import { GetTeamsService } from '../services/getTeams.service';

export class GetTeamsController {
  constructor(private readonly getTeamsService: GetTeamsService) {}

  public getTeams = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        teamType: req.query.teamType as string | undefined,
        organizationId: req.query.organizationId as string | undefined,
      };

      const result = await this.getTeamsService.getTeams(query);

      res.status(200).json({
        success: true,
        message: 'Liste des équipes récupérée avec succès.',
        data: result.data,
        pagination: { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages },
      });
    } catch (error) {
      next(error);
    }
  };
}