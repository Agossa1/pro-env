/*
 * |--------------------------------------------------------------------------
 * | GET INTERVENTION REPORTS SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération des rapports terrain d'une intervention.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { InterventionRepository } from '../repositories/intervention.repositories';
import type { FieldInterventionReport } from '../types/intervention.types';

export class GetInterventionReportsService {
  constructor(
    private readonly interventionRepository: InterventionRepository,
    private readonly logger: Logger,
  ) {}

  /** Récupère les rapports terrain d'une intervention. */
  public async getInterventionReports(
    interventionId: string
  ): Promise<FieldInterventionReport[]> {
    try {
      const reports = await this.interventionRepository.getInterventionReports(interventionId);
      this.logger.info(
        `Rapports de l'intervention ${interventionId} : ${reports.length} rapport(s)`
      );
      return reports;
    } catch (error: any) {
      this.logger.error(`Erreur getInterventionReports (service): ${error.message}`);
      throw error;
    }
  }
}