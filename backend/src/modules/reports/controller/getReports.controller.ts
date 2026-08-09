import type { Request, Response, NextFunction } from 'express';
import { GetReportsService } from '../services/getReports.service';

export class GetReportsController {
  constructor(private readonly getReportsService: GetReportsService) {}

  public getReports = async (
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
        issueCategory: req.query.issueCategory as string | undefined,
      };

      const result = await this.getReportsService.getReports(query);

      res.status(200).json({
        success: true,
        message: 'Liste des rapports récupérée avec succès.',
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