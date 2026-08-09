/*
 * |--------------------------------------------------------------------------
 * | GET REPORT BY ID SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'un rapport par son identifiant UUID.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { ReportRepository } from '../repositories/report.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';
import type { Report } from '../types/report.types';

export class GetReportByIdService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Récupère un rapport par son identifiant UUID.
   * @param id Identifiant UUID du rapport
   */
  public async getReportById(id: string): Promise<Report> {
    try {
      const report = await this.reportRepository.getReportById(id);
      if (!report) {
        throw new NotFoundError('Rapport introuvable.');
      }
      this.logger.info(`Rapport récupéré par ID : ${report.title}`);
      return report;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur getReportById (service): ${error.message}`);
      throw error;
    }
  }
}