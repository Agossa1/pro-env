import type { Logger } from 'winston';
import { DashboardRepository } from '../repositories/dashboard.repositories';
import { CategoryCount, DashboardFilters } from '../types/dashboard.types';

export class GetReportsByCategoryService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly logger: Logger,
  ) {}

  public async getReportsByCategory(filters?: DashboardFilters): Promise<CategoryCount[]> {
    try {
      return await this.dashboardRepository.getReportsByCategory(filters);
    } catch (error: any) {
      this.logger.error(`Erreur getReportsByCategory (service): ${error.message}`);
      throw error;
    }
  }
}