"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
class DashboardController {
    constructor(getKpisService, getActivityChartService, getReportsByCategoryService, getReportsByStatusService, getPriorityMissionsService, getRecentInterventionsService, getRecentReportsService) {
        this.getKpisService = getKpisService;
        this.getActivityChartService = getActivityChartService;
        this.getReportsByCategoryService = getReportsByCategoryService;
        this.getReportsByStatusService = getReportsByStatusService;
        this.getPriorityMissionsService = getPriorityMissionsService;
        this.getRecentInterventionsService = getRecentInterventionsService;
        this.getRecentReportsService = getRecentReportsService;
        this.getKpis = this.getKpis.bind(this);
        this.getActivityChart = this.getActivityChart.bind(this);
        this.getReportsByCategory = this.getReportsByCategory.bind(this);
        this.getReportsByStatus = this.getReportsByStatus.bind(this);
        this.getPriorityMissions = this.getPriorityMissions.bind(this);
        this.getRecentInterventions = this.getRecentInterventions.bind(this);
        this.getRecentReports = this.getRecentReports.bind(this);
    }
    async getKpis(req, res, next) {
        try {
            const user = req.user;
            const data = await this.getKpisService.getKpis(user.roleCode, user.organizationId ?? undefined);
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    async getActivityChart(req, res, next) {
        try {
            const period = req.query.period || 'monthly';
            const data = await this.getActivityChartService.getActivityChart(period);
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    async getReportsByCategory(req, res, next) {
        try {
            const data = await this.getReportsByCategoryService.getReportsByCategory();
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    async getReportsByStatus(req, res, next) {
        try {
            const data = await this.getReportsByStatusService.getReportsByStatus();
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    async getPriorityMissions(req, res, next) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
            const data = await this.getPriorityMissionsService.getPriorityMissions(limit);
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    async getRecentInterventions(req, res, next) {
        try {
            const user = req.user;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 6;
            const orgId = user.roleCode === 'societe' ? (user.organizationId ?? undefined) : undefined;
            const data = await this.getRecentInterventionsService.getRecentInterventions(limit, orgId);
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    async getRecentReports(req, res, next) {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
            const search = req.query.search || '';
            const status = req.query.status || '';
            const result = await this.getRecentReportsService.getRecentReports(page, limit, search, status);
            res.status(200).json({
                success: true,
                data: result.data,
                pagination: { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DashboardController = DashboardController;
//# sourceMappingURL=dashboard.controller.js.map