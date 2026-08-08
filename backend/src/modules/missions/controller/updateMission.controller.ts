import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UpdateMissionService } from '../services/updateMission.service';
import { IdParamSchema, UpdateMissionSchema } from '../validations/mission.validations';
import type { UpdateMissionPayload } from '../types/mission.types';

export class UpdateMissionController {
  constructor(private readonly updateMissionService: UpdateMissionService) {}

  public updateMission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);
      const payload = UpdateMissionSchema.parse(req.body) as UpdateMissionPayload;

      const mission = await this.updateMissionService.updateMission(id, payload);

      res.status(200).json({
        success: true,
        message: 'Mission mise à jour avec succès.',
        data: mission,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Erreur de validation des données.',
          errors: error.issues,
        });
        return;
      }
      next(error);
    }
  };
}