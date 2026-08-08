import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AssignUserToMissionService } from '../services/assignUserToMission.service';
import { IdParamSchema, AssignUserSchema } from '../validations/mission.validations';

export class AssignUserToMissionController {
  constructor(
    private readonly assignUserToMissionService: AssignUserToMissionService
  ) {}

  public assignUserToMission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);
      const { userId } = AssignUserSchema.parse(req.body);

      const context = {
        assignedBy: (req as any).user?.userId ?? undefined,
      };

      const assignment = await this.assignUserToMissionService.assignUserToMission(
        id,
        userId,
        context
      );

      res.status(200).json({
        success: true,
        message: 'Utilisateur assigné à la mission avec succès.',
        data: assignment,
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