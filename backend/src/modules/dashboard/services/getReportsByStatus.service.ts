import type { Logger } from 'winston';
import { DashboardRepository } from '../repositories/dashboard.repositories';
import { CategoryCount, DashboardFilters } from '../types/dashboard.types';

export class GetReportsByStatusService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly logger: Logger,
  ) {}

  public async getReportsByStatus(filters?: DashboardFilters): Promise<CategoryCount[]> {
    try {
      return await this.dashboardRepository.getReportsByStatus(filters);
    } catch (error: any) {
      this.logger.error(`Erreur getReportsByStatus (service): ${error.message}`);
      throw error;
    }
  }
}