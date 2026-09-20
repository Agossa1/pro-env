import type { Logger } from 'winston';
import { DashboardRepository } from '../repositories/dashboard.repositories';
import { RecentIntervention, DashboardFilters } from '../types/dashboard.types';

export class GetRecentInterventionsService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Récupère les interventions récentes.
   * Pour un utilisateur "societe", restreint le périmètre à son organisation.
   */
  public async getRecentInterventions(limit = 6, organizationId?: string, filters?: DashboardFilters): Promise<RecentIntervention[]> {
    try {
      return await this.dashboardRepository.getRecentInterventions(limit, organizationId, filters);
    } catch (error: any) {
      this.logger.error(`Erreur getRecentInterventions (service): ${error.message}`);
      throw error;
    }
  }
}