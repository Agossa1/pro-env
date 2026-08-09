import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UpdateTerritoryTypeService } from '../services/updateTerritoryType.service';
import { IdParamSchema, UpdateTerritoryTypeSchema } from '../validations/territory.validations';
import type { UpdateTerritoryTypePayload } from '../types/territory.types';

export class UpdateTerritoryTypeController {
  constructor(
    private readonly updateTerritoryTypeService: UpdateTerritoryTypeService
  ) {}

  public updateTerritoryType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);
      const payload = UpdateTerritoryTypeSchema.parse(req.body) as UpdateTerritoryTypePayload;

      const territoryType = await this.updateTerritoryTypeService.updateTerritoryType(id, payload);

      res.status(200).json({
        success: true,
        message: 'Type de territoire mis à jour avec succès.',
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