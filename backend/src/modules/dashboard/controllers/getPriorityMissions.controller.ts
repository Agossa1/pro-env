import type { Request, Response, NextFunction } from 'express';
import { GetPriorityMissionsService } from '../services/getPriorityMissions.service';

export class GetPriorityMissionsController {
  constructor(private readonly getPriorityMissionsService: GetPriorityMissionsService) {}

  public getPriorityMissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
      const data = await this.getPriorityMissionsService.getPriorityMissions(limit);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}