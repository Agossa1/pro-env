/*
 * |--------------------------------------------------------------------------
 * | DELETE REPORT SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de suppression logique d'un rapport de signalement.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { ReportRepository } from '../repositories/report.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';

export class DeleteReportService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Supprime logiquement un rapport par son identifiant UUID (deleted_at).
   * @param id Identifiant UUID du rapport à supprimer
   */
  public async deleteReport(id: string): Promise<void> {
    try {
      await this.reportRepository.deleteReport(id);
      this.logger.info(`Rapport supprimé : ${id}`);
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur deleteReport (service): ${error.message}`);
      throw error;
    }
  }
}