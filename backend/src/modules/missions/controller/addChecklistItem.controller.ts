import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AddChecklistItemService } from '../services/addChecklistItem.service';
import { IdParamSchema, ChecklistItemSchema } from '../validations/mission.validations';

export class AddChecklistItemController {
  constructor(
    private readonly addChecklistItemService: AddChecklistItemService
  ) {}

  public addChecklistItem = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);
      const { label } = ChecklistItemSchema.parse(req.body);

      const item = await this.addChecklistItemService.addChecklistItem(id, label);

      res.status(201).json({
        success: true,
        message: 'Tâche ajoutée à la checklist avec succès.',
        data: item,
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