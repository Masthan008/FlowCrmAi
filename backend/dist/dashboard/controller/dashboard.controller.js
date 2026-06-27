"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = void 0;
const dashboard_service_1 = require("../service/dashboard.service");
const response_1 = require("../../helpers/response");
exports.dashboardController = {
    /**
     * GET /dashboard/overview
     */
    getOverview: async (req, res, next) => {
        try {
            const data = await dashboard_service_1.dashboardService.getOverview();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Dashboard overview statistics loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /dashboard/charts
     */
    getCharts: async (req, res, next) => {
        try {
            const timeframe = req.query.timeframe || '12m';
            const data = await dashboard_service_1.dashboardService.getChartsData(timeframe);
            response_1.ResponseHelper.sendSuccess(req, res, 200, `Dashboard trend chart data loaded for: ${timeframe}`, data);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /dashboard/activities
     */
    getActivities: async (req, res, next) => {
        try {
            const data = await dashboard_service_1.dashboardService.getRecentActivities();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Recent database activity logs loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /dashboard/tasks
     */
    getTasks: async (req, res, next) => {
        try {
            const data = await dashboard_service_1.dashboardService.getUpcomingTasks();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Upcoming task list items loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /dashboard/deals
     */
    getDeals: async (req, res, next) => {
        try {
            const data = await dashboard_service_1.dashboardService.getRecentDeals();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Recent active deal pipelines loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /dashboard/business-overview
     */
    getBusinessOverview: async (req, res, next) => {
        try {
            const timeframe = req.query.timeframe || '30d';
            const customStart = req.query.startDate;
            const customEnd = req.query.endDate;
            const data = await dashboard_service_1.dashboardService.getBusinessOverview(timeframe, customStart, customEnd);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Business overview aggregates loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /dashboard/pipeline
     */
    getPipeline: async (req, res, next) => {
        try {
            const timeframe = req.query.timeframe || '30d';
            const customStart = req.query.startDate;
            const customEnd = req.query.endDate;
            const data = await dashboard_service_1.dashboardService.getPipeline(timeframe, customStart, customEnd);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Sales pipeline stages overview loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /dashboard/revenue
     */
    getRevenue: async (req, res, next) => {
        try {
            const data = await dashboard_service_1.dashboardService.getRevenue();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Revenue analytics calculations loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /dashboard/team
     */
    getTeam: async (req, res, next) => {
        try {
            const data = await dashboard_service_1.dashboardService.getTeam();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Team leaderboard statistics loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /dashboard/goals
     */
    getGoals: async (req, res, next) => {
        try {
            const data = await dashboard_service_1.dashboardService.getGoals();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Corporate target target-sales loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /dashboard/health
     */
    getHealth: async (req, res, next) => {
        try {
            const data = await dashboard_service_1.dashboardService.getHealth();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Business health index compliance metrics loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /dashboard/calendar-preview
     */
    getCalendarPreview: async (req, res, next) => {
        try {
            const data = await dashboard_service_1.dashboardService.getCalendarPreview();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Calendar schedule preview loads successfully.', data);
        }
        catch (error) {
            next(error);
        }
    }
};
exports.default = exports.dashboardController;
