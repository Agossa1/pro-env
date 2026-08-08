import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetInterventionReportsService } from '../services/getInterventionReports.service';
import { IdParamSchema } from '../validations/intervention.validations';

export class GetInterventionReportsController {
  constructor(
    private readonly getInterventionReportsService: GetInterventionReportsService
  ) {}

  public getInterventionReports = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);

      const reports = await this.getInterventionReportsService.getInterventionReports(id);

      res.status(200).json({
        success: true,
        message: 'Rapports d\'intervention récupérés avec succès.',
        data: reports,
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