import type { Logger } from 'winston';
import { DashboardRepository } from '../repositories/dashboard.repositories';
import { PriorityMission, DashboardFilters } from '../types/dashboard.types';

export class GetPriorityMissionsService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly logger: Logger,
  ) {}

  public async getPriorityMissions(limit = 5, filters?: DashboardFilters): Promise<PriorityMission[]> {
    try {
      return await this.dashboardRepository.getPriorityMissions(limit, filters);
    } catch (error: any) {
      this.logger.error(`Erreur getPriorityMissions (service): ${error.message}`);
      throw error;
    }
  }
}