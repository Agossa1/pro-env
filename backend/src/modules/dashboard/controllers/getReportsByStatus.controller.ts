import type { Request, Response, NextFunction } from 'express';
import { GetReportsByStatusService } from '../services/getReportsByStatus.service';

export class GetReportsByStatusController {
  constructor(private readonly getReportsByStatusService: GetReportsByStatusService) {}

  public getReportsByStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.getReportsByStatusService.getReportsByStatus();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}