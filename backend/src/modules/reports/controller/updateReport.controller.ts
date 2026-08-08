import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UpdateReportService } from '../services/updateReport.service';
import { IdParamSchema, UpdateReportSchema } from '../validations/report.validations';
import type { UpdateReportPayload } from '../types/report.types';

export class UpdateReportController {
  constructor(private readonly updateReportService: UpdateReportService) {}

  public updateReport = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);
      const payload = UpdateReportSchema.parse(req.body) as UpdateReportPayload;

      const report = await this.updateReportService.updateReport(id, payload);

      res.status(200).json({
        success: true,
        message: 'Rapport mis à jour avec succès.',
        data: report,
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