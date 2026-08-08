import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetReportDetailsService } from '../services/getReportDetails.service';
import { IdParamSchema } from '../validations/report.validations';

export class GetReportDetailsController {
  constructor(private readonly getReportDetailsService: GetReportDetailsService) {}

  public getReportDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);

      const details = await this.getReportDetailsService.getReportDetails(id);

      res.status(200).json({
        success: true,
        message: 'Détails du rapport récupérés avec succès.',
        data: details,
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