import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DeleteReportService } from '../services/deleteReport.service';
import { IdParamSchema } from '../validations/report.validations';

export class DeleteReportController {
  constructor(private readonly deleteReportService: DeleteReportService) {}

  public deleteReport = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);

      await this.deleteReportService.deleteReport(id);

      res.status(200).json({
        success: true,
        message: 'Rapport supprimé avec succès.',
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