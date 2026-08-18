import type { Request, Response, NextFunction } from 'express';
import { TokenPayload } from '../../auth/types/auth.types';
import { GetKpisService } from '../services/getKpis.service';

export class GetKpisController {
  constructor(private readonly getKpisService: GetKpisService) {}

  public getKpis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as TokenPayload;
      const data = await this.getKpisService.getKpis(user.roleCode, user.organizationId ?? undefined);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}