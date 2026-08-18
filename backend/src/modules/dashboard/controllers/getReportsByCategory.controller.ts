import type { Request, Response, NextFunction } from 'express';
import { GetReportsByCategoryService } from '../services/getReportsByCategory.service';

export class GetReportsByCategoryController {
  constructor(private readonly getReportsByCategoryService: GetReportsByCategoryService) {}

  public getReportsByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.getReportsByCategoryService.getReportsByCategory();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}