import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CreateTerritoryService } from '../services/createTerritory.service';
import { CreateTerritorySchema } from '../validations/territory.validations';
import type { CreateTerritoryPayload } from '../types/territory.types';

export class CreateTerritoryController {
  constructor(private readonly createTerritoryService: CreateTerritoryService) {}

  public createTerritory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // 1. Validation des données d'entrée (avec GeoJSON uploadé)
      const payload = CreateTerritorySchema.parse(req.body) as CreateTerritoryPayload;

      // 2. Contexte créateur (utilisateur authentifié si présent)
      const creatorId = (req as any).user?.userId ?? null;

      // 3. Appel au service métier
      const territory = await this.createTerritoryService.createTerritory(payload, creatorId);

      // 4. Réponse standardisée
      res.status(201).json({
        success: true,
        message: 'Territoire créé avec succès.',
        data: territory,
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