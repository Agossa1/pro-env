import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetReportByIdService } from '../services/getReportById.service';
import { IdParamSchema } from '../validations/report.validations';

export class GetReportByIdController {
  constructor(private readonly getReportByIdService: GetReportByIdService) {}

  public getReportById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);

      const report = await this.getReportByIdService.getReportById(id);

      res.status(200).json({
        success: true,
        message: 'Rapport récupéré avec succès.',
        data: report,
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