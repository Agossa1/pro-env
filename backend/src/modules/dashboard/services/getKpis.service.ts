import type { Logger } from 'winston';
import { DashboardRepository } from '../repositories/dashboard.repositories';
import { DashboardKpis, DashboardFilters } from '../types/dashboard.types';

export class GetKpisService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Calcule les KPIs du tableau de bord selon le rôle de l'utilisateur :
   * - "societe" : KPIs restreints à son organisation.
   * - autres     : KPIs globaux de la plateforme.
   */
  public async getKpis(userRole: string, organizationId?: string, filters?: DashboardFilters): Promise<DashboardKpis> {
    try {
      if (userRole === 'societe' && organizationId) {
        return this.getSocieteKpis(organizationId);
      }
      return this.getPlatformKpis(filters);
    } catch (error: any) {
      this.logger.error(`Erreur getKpis (service): ${error.message}`);
      throw error;
    }
  }

  private async getSocieteKpis(organizationId: string): Promise<DashboardKpis> {
    const stats = await this.dashboardRepository.getSocieteKpis(organizationId);

    return {
      totalReports: 0,
      reportsThisMonth: 0,
      reportsChangePercent: 0,
      activeMissions: stats.activeMissions,
      activeInterventions: stats.activeInterventions,
      activeSocietes: 0,
      resolutionRate: stats.resolutionRate,
      resolutionRateChange: 0,
    };
  }

  private async getPlatformKpis(filters?: DashboardFilters): Promise<DashboardKpis> {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const stats = await this.dashboardRepository.getAdminKpis(thisMonth, lastMonth, filters);

    const { thisMonthReports, lastMonthReports, currentRate, pastRate } = stats;
    const reportsChangePercent = lastMonthReports === 0
      ? 0
      : Math.round(((thisMonthReports - lastMonthReports) / lastMonthReports) * 100);

    const resolutionRateChange = pastRate === 0
      ? 0
      : Math.round(((currentRate - pastRate) / pastRate) * 100);

    return {
      totalReports: stats.totalReports,
      reportsThisMonth: thisMonthReports,
      reportsChangePercent,
      activeMissions: stats.activeMissions,
      activeInterventions: stats.activeInterventions,
      activeSocietes: stats.activeSocietes,
      resolutionRate: Math.round(currentRate),
      resolutionRateChange,
    };
  }
}