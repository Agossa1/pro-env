import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AddMemberToTeamService } from '../services/addMemberToTeam.service';
import { IdParamSchema, AddMemberSchema } from '../validations/team.validations';
import { TeamMemberRole } from '../types/team.enums';

export class AddMemberToTeamController {
  constructor(private readonly addMemberToTeamService: AddMemberToTeamService) {}

  public addMemberToTeam = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);
      const { userId, role } = AddMemberSchema.parse(req.body);

      const member = await this.addMemberToTeamService.addMemberToTeam(
        id,
        userId,
        role as TeamMemberRole | undefined
      );

      res.status(201).json({
        success: true,
        message: 'Membre ajouté à l\'équipe avec succès.',
        data: member,
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