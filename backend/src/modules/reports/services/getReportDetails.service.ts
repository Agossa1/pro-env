/*
 * |--------------------------------------------------------------------------
 * | GET REPORT DETAILS SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération des détails 1:1 d'un rapport
 * | selon sa catégorie (drainage, route, déchets, biodiversité, environnement).
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { ReportRepository } from '../repositories/report.repositories';

export class GetReportDetailsService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Récupère le détail d'un rapport selon sa catégorie.
   * @param reportId Identifiant UUID du rapport
   */
  public async getReportDetails(reportId: string): Promise<any | null> {
    try {
      const details = await this.reportRepository.getReportDetails(reportId);
      this.logger.info(`Détails du rapport ${reportId} récupérés`);
      return details;
    } catch (error: any) {
      this.logger.error(`Erreur getReportDetails (service): ${error.message}`);
      throw error;
    }
  }
}