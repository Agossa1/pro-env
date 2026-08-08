import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DeleteMissionService } from '../services/deleteMission.service';
import { IdParamSchema } from '../validations/mission.validations';

export class DeleteMissionController {
  constructor(private readonly deleteMissionService: DeleteMissionService) {}

  public deleteMission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);

      await this.deleteMissionService.deleteMission(id);

      res.status(200).json({
        success: true,
        message: 'Mission supprimée avec succès.',
        data: null,
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