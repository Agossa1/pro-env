/*
 * |--------------------------------------------------------------------------
 * | GET REPORTS SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération paginée de la liste des rapports.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { ReportRepository } from '../repositories/report.repositories';
import type { Report, PaginationQuery, PaginatedResult } from '../types/report.types';

export interface GetAllReportsQuery extends PaginationQuery {
  territoryId?: string;
  createdBy?: string;
  status?: string;
  issueCategory?: string;
}

export class GetReportsService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Récupère la liste paginée des rapports avec filtres optionnels.
   * @param query Paramètres de pagination + filtres (territoire, statut, catégorie)
   */
  public async getReports(
    query: GetAllReportsQuery = {}
  ): Promise<PaginatedResult<Report>> {
    try {
      const result = await this.reportRepository.getAllReports(query);
      this.logger.info(
        `Liste des rapports récupérée : ${result.total} résultat(s) - page ${result.page}/${result.totalPages}`
      );
      return result;
    } catch (error: any) {
      this.logger.error(`Erreur getReports (service): ${error.message}`);
      throw error;
    }
  }
}