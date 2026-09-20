import type { Request, Response, NextFunction } from 'express';
import { GetPriorityMissionsService } from '../services/getPriorityMissions.service';
import { getScopeFilters } from '../../../shared/helpers/scopeFilters.helper';

export class GetPriorityMissionsController {
  constructor(private readonly getPriorityMissionsService: GetPriorityMissionsService) {}

  public getPriorityMissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = getScopeFilters(req);
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
      const data = await this.getPriorityMissionsService.getPriorityMissions(limit, filters);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}