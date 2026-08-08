/*
 * |--------------------------------------------------------------------------
 * | CREATE REPORT SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de création d'un signalement (rapport terrain).
 * | Injecte le créateur (utilisateur connecté) et valide les entrées.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { ReportRepository } from '../repositories/report.repositories';
import { BadRequestError } from '../../../shared/errors/appErrors';
import type { Report, CreateReportPayload } from '../types/report.types';

export interface CreateReportContext {
  userId?: string;
}

export class CreateReportService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Crée un nouveau rapport de signalement.
   * @param payload Données du rapport (territoire, titre, catégorie...)
   * @param creator Contexte de l'utilisateur connecté (userId)
   */
  public async createReport(
    payload: CreateReportPayload,
    creator?: CreateReportContext
  ): Promise<Report> {
    try {
      if (!payload.territoryId || !payload.title || !payload.issueCategory) {
        throw new BadRequestError(
          'Le territoire, le titre et la catégorie du rapport sont requis.'
        );
      }

      const created = await this.reportRepository.createReport({
        ...payload,
        createdBy: creator?.userId ?? payload.createdBy ?? null,
      });

      this.logger.info(`Rapport créé : ${created.title} (${created.issueCategory})`);
      return created;
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;
      this.logger.error(`Erreur createReport (service): ${error.message}`);
      throw error;
    }
  }
}