import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetReportStatusHistoryService } from '../services/getReportStatusHistory.service';
import { IdParamSchema } from '../validations/report.validations';

export class GetReportStatusHistoryController {
  constructor(
    private readonly getReportStatusHistoryService: GetReportStatusHistoryService
  ) {}

  public getReportStatusHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);

      const history = await this.getReportStatusHistoryService.getReportStatusHistory(id);

      res.status(200).json({
        success: true,
        message: 'Historique des statuts récupéré avec succès.',
        data: history,
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