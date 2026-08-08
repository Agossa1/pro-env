import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DeleteTerritoryTypeService } from '../services/deleteTerritoryType.service';
import { IdParamSchema } from '../validations/territory.validations';

export class DeleteTerritoryTypeController {
  constructor(
    private readonly deleteTerritoryTypeService: DeleteTerritoryTypeService
  ) {}

  public deleteTerritoryType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);

      await this.deleteTerritoryTypeService.deleteTerritoryType(id);

      res.status(200).json({
        success: true,
        message: 'Type de territoire supprimé avec succès.',
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