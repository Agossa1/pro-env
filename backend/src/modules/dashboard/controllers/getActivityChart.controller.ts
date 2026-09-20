import type { Request, Response, NextFunction } from 'express';
import { GetActivityChartService, ActivityChartPeriod } from '../services/getActivityChart.service';
import { getScopeFilters } from '../../../shared/helpers/scopeFilters.helper';

export class GetActivityChartController {
  constructor(private readonly getActivityChartService: GetActivityChartService) {}

  public getActivityChart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = getScopeFilters(req);
      const period = (req.query.period as ActivityChartPeriod) || 'monthly';
      const data = await this.getActivityChartService.getActivityChart(period, filters);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}