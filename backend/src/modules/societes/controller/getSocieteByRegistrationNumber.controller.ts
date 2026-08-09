import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetSocieteByRegistrationNumberService } from '../services/getSocieteByRegistrationNumber.service';
import { RegistrationNumberParamSchema } from '../validations/societe.validations';

export class GetSocieteByRegistrationNumberController {
  constructor(
    private readonly getSocieteByRegistrationNumberService: GetSocieteByRegistrationNumberService
  ) {}

  public getSocieteByRegistrationNumber = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { registrationNumber } = RegistrationNumberParamSchema.parse(req.params);

      const societe = await this.getSocieteByRegistrationNumberService
        .getSocieteByRegistrationNumber(registrationNumber);

      res.status(200).json({
        success: true,
        message: 'Société récupérée avec succès.',
        data: societe,
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