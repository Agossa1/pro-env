/*
 * |--------------------------------------------------------------------------
 * | GET REPORT STATUS HISTORY SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération de l'historique des statuts d'un rapport.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { ReportRepository } from '../repositories/report.repositories';
import type { ReportStatusHistory } from '../types/report.types';

export class GetReportStatusHistoryService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Récupère l'historique des statuts d'un rapport.
   * @param reportId Identifiant UUID du rapport
   */
  public async getReportStatusHistory(reportId: string): Promise<ReportStatusHistory[]> {
    try {
      const history = await this.reportRepository.getReportStatusHistory(reportId);
      this.logger.info(`Historique du rapport ${reportId} : ${history.length} entrée(s)`);
      return history;
    } catch (error: any) {
      this.logger.error(`Erreur getReportStatusHistory (service): ${error.message}`);
      throw error;
    }
  }
}