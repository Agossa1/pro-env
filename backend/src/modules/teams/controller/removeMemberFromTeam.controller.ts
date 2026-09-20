import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { RemoveMemberFromTeamService } from '../services/removeMemberFromTeam.service';
import { IdParamSchema, MemberIdParamSchema } from '../validations/team.validations';

export class RemoveMemberFromTeamController {
  constructor(
    private readonly removeMemberFromTeamService: RemoveMemberFromTeamService
  ) {}

  public removeMemberFromTeam = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const allowedRoles = ['societe', 'admin_mairie'];
      if (!req.user || !allowedRoles.includes(req.user.roleCode)) {
        res.status(403).json({
          success: false,
          message: 'Action non autorisée. Seuls les entreprises (prestataires) et les DST (mairies) peuvent retirer des membres.',
        });
        return;
      }

      const { id } = IdParamSchema.parse(req.params);
      const { memberId } = MemberIdParamSchema.parse(req.params);

      await this.removeMemberFromTeamService.removeMemberFromTeam(id, memberId);

      res.status(200).json({
        success: true,
        message: 'Membre retiré de l\'équipe avec succès.',
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