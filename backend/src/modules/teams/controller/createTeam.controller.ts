import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CreateTeamService } from '../services/createTeam.service';
import { CreateTeamSchema } from '../validations/team.validations';
import type { CreateTeamPayload } from '../types/team.types';

export class CreateTeamController {
  constructor(private readonly createTeamService: CreateTeamService) {}

  public createTeam = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const payload = CreateTeamSchema.parse(req.body) as CreateTeamPayload;
      const team = await this.createTeamService.createTeam(payload);

      res.status(201).json({
        success: true,
        message: 'Équipe créée avec succès.',
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