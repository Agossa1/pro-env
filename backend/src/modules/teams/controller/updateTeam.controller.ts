import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UpdateTeamService } from '../services/updateTeam.service';
import { IdParamSchema, UpdateTeamSchema } from '../validations/team.validations';
import type { UpdateTeamPayload } from '../types/team.types';

export class UpdateTeamController {
  constructor(private readonly updateTeamService: UpdateTeamService) {}

  public updateTeam = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);
      const payload = UpdateTeamSchema.parse(req.body) as UpdateTeamPayload;
      const team = await this.updateTeamService.updateTeam(id, payload);

      res.status(200).json({
        success: true,
        message: 'Équipe mise à jour avec succès.',
        data: team,
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