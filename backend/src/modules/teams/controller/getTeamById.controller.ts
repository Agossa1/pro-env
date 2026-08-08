import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetTeamByIdService } from '../services/getTeamById.service';
import { IdParamSchema } from '../validations/team.validations';

export class GetTeamByIdController {
  constructor(private readonly getTeamByIdService: GetTeamByIdService) {}

  public getTeamById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);
      const team = await this.getTeamByIdService.getTeamById(id);

      res.status(200).json({
        success: true,
        message: 'Équipe récupérée avec succès.',
        data: team,
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