"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetKpisService = void 0;
class GetKpisService {
    constructor(dashboardRepository, logger) {
        this.dashboardRepository = dashboardRepository;
        this.logger = logger;
    }
    /**
     * Calcule les KPIs du tableau de bord selon le rôle de l'utilisateur :
     * - "societe" : KPIs restreints à son organisation.
     * - autres     : KPIs globaux de la plateforme.
     */
    async getKpis(userRole, organizationId) {
        try {
            if (userRole === 'societe' && organizationId) {
                return this.getSocieteKpis(organizationId);
            }
            return this.getPlatformKpis();
        }
        catch (error) {
            this.logger.error(`Erreur getKpis (service): ${error.message}`);
            throw error;
        }
    }
    async getSocieteKpis(organizationId) {
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
    async getPlatformKpis() {
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const stats = await this.dashboardRepository.getAdminKpis(thisMonth, lastMonth);
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
exports.GetKpisService = GetKpisService;
//# sourceMappingURL=getKpis.service.js.map