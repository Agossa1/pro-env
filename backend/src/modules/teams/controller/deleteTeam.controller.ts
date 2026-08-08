import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DeleteTeamService } from '../services/deleteTeam.service';
import { IdParamSchema } from '../validations/team.validations';

export class DeleteTeamController {
  constructor(private readonly deleteTeamService: DeleteTeamService) {}

  public deleteTeam = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);
      await this.deleteTeamService.deleteTeam(id);

      res.status(200).json({
        success: true,
        message: 'Équipe supprimée avec succès.',
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