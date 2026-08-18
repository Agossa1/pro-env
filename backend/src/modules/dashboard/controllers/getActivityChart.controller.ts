import type { Request, Response, NextFunction } from 'express';
import { GetActivityChartService, ActivityChartPeriod } from '../services/getActivityChart.service';

export class GetActivityChartController {
  constructor(private readonly getActivityChartService: GetActivityChartService) {}

  public getActivityChart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const period = (req.query.period as ActivityChartPeriod) || 'monthly';
      const data = await this.getActivityChartService.getActivityChart(period);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}