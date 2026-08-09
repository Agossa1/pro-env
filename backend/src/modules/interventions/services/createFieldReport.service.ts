/*
 * |--------------------------------------------------------------------------
 * | CREATE FIELD REPORT SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de création d'un rapport d'intervention terrain.
 * | Injecte l'utilisateur connecté comme créateur.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { InterventionRepository } from '../repositories/intervention.repositories';
import { BadRequestError } from '../../../shared/errors/appErrors';
import type {
  FieldInterventionReport,
  CreateFieldReportPayload,
} from '../types/intervention.types';

export interface CreateFieldReportContext {
  userId?: string;
}

export class CreateFieldReportService {
  constructor(
    private readonly interventionRepository: InterventionRepository,
    private readonly logger: Logger,
  ) {}

  /** Crée un rapport d'intervention terrain (auteur = utilisateur connecté). */
  public async createFieldReport(
    payload: CreateFieldReportPayload,
    creator?: CreateFieldReportContext
  ): Promise<FieldInterventionReport> {
    try {
      if (!payload.interventionId) {
        throw new BadRequestError('L\'intervention est requise.');
      }

      const report = await this.interventionRepository.createFieldReport({
        ...payload,
        createdBy: creator?.userId ?? payload.createdBy ?? null,
      });

      this.logger.info(
        `Rapport d'intervention créé : intervention ${payload.interventionId}`
      );
      return report;
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;
      this.logger.error(`Erreur createFieldReport (service): ${error.message}`);
      throw error;
    }
  }
}