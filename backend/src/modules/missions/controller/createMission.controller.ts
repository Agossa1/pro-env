import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CreateMissionService } from '../services/createMission.service';
import { CreateMissionSchema } from '../validations/mission.validations';
import type { CreateMissionPayload } from '../types/mission.types';

export class CreateMissionController {
  constructor(private readonly createMissionService: CreateMissionService) {}

  public createMission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const payload = CreateMissionSchema.parse(req.body) as CreateMissionPayload;

      // Injecte l'utilisateur connecté comme créateur de la mission
      const creator = {
        userId: (req as any).user?.userId ?? undefined,
      };

      const mission = await this.createMissionService.createMission(payload, creator);

      res.status(201).json({
        success: true,
        message: 'Mission créée avec succès.',
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