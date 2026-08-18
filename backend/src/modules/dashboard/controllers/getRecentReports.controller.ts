import type { Request, Response, NextFunction } from 'express';
import { GetRecentReportsService } from '../services/getRecentReports.service';

export class GetRecentReportsController {
  constructor(private readonly getRecentReportsService: GetRecentReportsService) {}

  public getRecentReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = (req.query.search as string) || '';
      const status = (req.query.status as string) || '';
      const result = await this.getRecentReportsService.getRecentReports(page, limit, search, status);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages },
      });
    } catch (error) {
      next(error);
    }
  };
}