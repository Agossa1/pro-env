import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CreateSocieteService } from '../services/createSociete.service';
import { CreateSocieteSchema } from '../validations/societe.validations';
import type { CreateSocietePayload } from '../types/societe.types';

export class CreateSocieteController {
  constructor(private readonly createSocieteService: CreateSocieteService) {}

  public createSociete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const payload = CreateSocieteSchema.parse(req.body) as CreateSocietePayload;

      // Contexte de l'utilisateur connecté :
      // - une mairie/ministère crée sa société → municipalityId = req.user.municipalityId
      // - un admin fournit le municipalityId dans le body (association libre)
      const creator = {
        userId: (req as any).user?.userId ?? undefined,
        municipalityId: (req as any).user?.municipalityId ?? null,
      };

      const societe = await this.createSocieteService.createSociete(payload, creator);

      res.status(201).json({
        success: true,
        message: 'Société créée avec succès.',
        data: societe,
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