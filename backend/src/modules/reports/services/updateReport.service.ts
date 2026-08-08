/*
 * |--------------------------------------------------------------------------
 * | UPDATE REPORT SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de mise à jour d'un rapport de signalement.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { ReportRepository } from '../repositories/report.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';
import type { Report, UpdateReportPayload } from '../types/report.types';

export class UpdateReportService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Met à jour un rapport existant.
   * @param id Identifiant UUID du rapport
   * @param payload Champs modifiables (titre, statut, priorité...)
   */
  public async updateReport(
    id: string,
    payload: UpdateReportPayload
  ): Promise<Report> {
    try {
      const updated = await this.reportRepository.updateReport(id, payload);
      if (!updated) {
        throw new NotFoundError('Rapport introuvable.');
      }
      this.logger.info(`Rapport mis à jour : ${updated.title}`);
      return updated;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur updateReport (service): ${error.message}`);
      throw error;
    }
  }
}