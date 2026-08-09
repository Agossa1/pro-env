import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CreateFieldReportService } from '../services/createFieldReport.service';
import { IdParamSchema, CreateFieldReportSchema } from '../validations/intervention.validations';
import type { CreateFieldReportPayload } from '../types/intervention.types';

export class CreateFieldReportController {
  constructor(private readonly createFieldReportService: CreateFieldReportService) {}

  public createFieldReport = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);
      const body = CreateFieldReportSchema.parse(req.body) as Omit<CreateFieldReportPayload, 'interventionId' | 'createdBy'>;

      const payload: CreateFieldReportPayload = {
        ...body,
        interventionId: id,
      };

      const creator = {
        userId: (req as any).user?.userId ?? undefined,
      };

      const report = await this.createFieldReportService.createFieldReport(payload, creator);

      res.status(201).json({
        success: true,
        message: 'Rapport d\'intervention créé avec succès.',
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