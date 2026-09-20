import type { Logger } from 'winston';
import { DashboardRepository } from '../repositories/dashboard.repositories';
import { ActivityPoint, DashboardFilters } from '../types/dashboard.types';

export type ActivityChartPeriod = 'monthly' | 'quarterly';

export class GetActivityChartService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly logger: Logger,
  ) {}

  public async getActivityChart(period: ActivityChartPeriod = 'monthly', filters?: DashboardFilters): Promise<ActivityPoint[]> {
    try {
      // 12 mois de profondeur, quel que soit le mode d'affichage.
      const months = 12;
      return await this.dashboardRepository.getActivityChart(months, filters);
    } catch (error: any) {
      this.logger.error(`Erreur getActivityChart (service): ${error.message}`);
      throw error;
    }
  }
}