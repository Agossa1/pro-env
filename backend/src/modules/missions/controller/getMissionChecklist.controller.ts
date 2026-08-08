import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetMissionChecklistService } from '../services/getMissionChecklist.service';
import { IdParamSchema } from '../validations/mission.validations';

export class GetMissionChecklistController {
  constructor(
    private readonly getMissionChecklistService: GetMissionChecklistService
  ) {}

  public getMissionChecklist = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);

      const checklist = await this.getMissionChecklistService.getMissionChecklist(id);

      res.status(200).json({
        success: true,
        message: 'Checklist récupérée avec succès.',
        data: checklist,
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