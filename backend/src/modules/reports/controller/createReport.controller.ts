import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CreateReportService } from '../services/createReport.service';
import { CreateReportSchema } from '../validations/report.validations';
import type { CreateReportPayload } from '../types/report.types';

export class CreateReportController {
  constructor(private readonly createReportService: CreateReportService) {}

  public createReport = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const payload = CreateReportSchema.parse(req.body) as CreateReportPayload;

      // Injecte l'utilisateur connecté comme créateur du rapport
      const creator = {
        userId: (req as any).user?.userId ?? undefined,
      };

      const report = await this.createReportService.createReport(payload, creator);

      res.status(201).json({
        success: true,
        message: 'Rapport créé avec succès.',
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