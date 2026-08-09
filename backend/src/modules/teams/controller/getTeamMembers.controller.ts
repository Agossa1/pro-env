import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetTeamMembersService } from '../services/getTeamMembers.service';
import { IdParamSchema } from '../validations/team.validations';

export class GetTeamMembersController {
  constructor(private readonly getTeamMembersService: GetTeamMembersService) {}

  public getTeamMembers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);
      const members = await this.getTeamMembersService.getTeamMembers(id);

      res.status(200).json({
        success: true,
        message: 'Membres de l\'équipe récupérés avec succès.',
        data: members,
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