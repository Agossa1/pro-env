import type { Logger } from 'winston';
import { DashboardRepository } from '../repositories/dashboard.repositories';
import { RecentReportsResult, DashboardFilters } from '../types/dashboard.types';

export class GetRecentReportsService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly logger: Logger,
  ) {}

  public async getRecentReports(
    page = 1,
    limit = 10,
    search = '',
    status = '',
    filters?: DashboardFilters
  ): Promise<RecentReportsResult> {
    try {
      const offset = (page - 1) * limit;
      const { data, total } = await this.dashboardRepository.getRecentReports(
        offset,
        limit,
        search,
        status,
        filters
      );

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      this.logger.error(`Erreur getRecentReports (service): ${error.message}`);
      throw error;
    }
  }
}