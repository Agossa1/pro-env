import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CreateTerritoryTypeService } from '../services/createTerritoryType.service';
import { CreateTerritoryTypeSchema } from '../validations/territory.validations';
import type { CreateTerritoryTypePayload } from '../types/territory.types';

export class CreateTerritoryTypeController {
  constructor(
    private readonly createTerritoryTypeService: CreateTerritoryTypeService
  ) {}

  public createTerritoryType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const payload = CreateTerritoryTypeSchema.parse(req.body) as CreateTerritoryTypePayload;

      const territoryType = await this.createTerritoryTypeService.createTerritoryType(payload);

      res.status(201).json({
        success: true,
        message: 'Type de territoire créé avec succès.',
        data: territoryType,
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