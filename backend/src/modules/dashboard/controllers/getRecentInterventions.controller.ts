import type { Request, Response, NextFunction } from 'express';
import { TokenPayload } from '../../auth/types/auth.types';
import { GetRecentInterventionsService } from '../services/getRecentInterventions.service';
import { getScopeFilters } from '../../../shared/helpers/scopeFilters.helper';

export class GetRecentInterventionsController {
  constructor(private readonly getRecentInterventionsService: GetRecentInterventionsService) {}

  public getRecentInterventions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as TokenPayload;
      const filters = getScopeFilters(req);
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 6;
      const orgId = user.roleCode === 'societe' ? (user.organizationId ?? undefined) : undefined;
      const data = await this.getRecentInterventionsService.getRecentInterventions(limit, orgId, filters);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}