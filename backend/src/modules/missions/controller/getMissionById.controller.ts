import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetMissionByIdService } from '../services/getMissionById.service';
import { IdParamSchema } from '../validations/mission.validations';

export class GetMissionByIdController {
  constructor(private readonly getMissionByIdService: GetMissionByIdService) {}

  public getMissionById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);

      const mission = await this.getMissionByIdService.getMissionById(id);

      res.status(200).json({
        success: true,
        message: 'Mission récupérée avec succès.',
        data: mission,
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