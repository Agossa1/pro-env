import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetMissionStatusHistoryService } from '../services/getMissionStatusHistory.service';
import { IdParamSchema } from '../validations/mission.validations';

export class GetMissionStatusHistoryController {
  constructor(
    private readonly getMissionStatusHistoryService: GetMissionStatusHistoryService
  ) {}

  public getMissionStatusHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);

      const history = await this.getMissionStatusHistoryService.getMissionStatusHistory(id);

      res.status(200).json({
        success: true,
        message: 'Historique des statuts récupéré avec succès.',
        data: history,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Erreur de validation des paramètres.',
          errors: error.issues,
        });
        return;
      }
      next(error);
    }
  };
}