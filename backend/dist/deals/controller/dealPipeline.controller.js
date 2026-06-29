"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealPipelineController = void 0;
const dealPipeline_service_1 = require("../service/dealPipeline.service");
class DealPipelineController {
    // ─── PIPELINE CRUD ──────────────────────────────────────
    async listPipelines(req, res) {
        try {
            const pipelines = await dealPipeline_service_1.dealPipelineService.getPipelines();
            res.json({ success: true, data: pipelines });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async getPipeline(req, res) {
        try {
            const pipeline = await dealPipeline_service_1.dealPipelineService.getPipelineById(req.params.pipeId);
            if (!pipeline)
                return res.status(404).json({ success: false, message: 'Pipeline not found' });
            res.json({ success: true, data: pipeline });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async createPipeline(req, res) {
        try {
            const userId = req.user?.id;
            const pipeline = await dealPipeline_service_1.dealPipelineService.createPipeline({ ...req.body, createdBy: userId });
            res.status(201).json({ success: true, data: pipeline });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async updatePipeline(req, res) {
        try {
            const userId = req.user?.id;
            const pipeline = await dealPipeline_service_1.dealPipelineService.updatePipeline(req.params.pipeId, { ...req.body, updatedBy: userId });
            res.json({ success: true, data: pipeline });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async deletePipeline(req, res) {
        try {
            const userId = req.user?.id;
            await dealPipeline_service_1.dealPipelineService.deletePipeline(req.params.pipeId, userId);
            res.json({ success: true, message: 'Pipeline deleted' });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async duplicatePipeline(req, res) {
        try {
            const userId = req.user?.id;
            const pipeline = await dealPipeline_service_1.dealPipelineService.duplicatePipeline(req.params.pipeId, userId);
            res.status(201).json({ success: true, data: pipeline });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    // ─── KANBAN ─────────────────────────────────────────────
    async getKanban(req, res) {
        try {
            const pipelineId = req.query.pipelineId;
            const filters = {};
            if (req.query.status)
                filters.status = req.query.status;
            if (req.query.assignedToId)
                filters.assignedToId = req.query.assignedToId;
            if (req.query.priority)
                filters.priority = req.query.priority;
            if (req.query.industry)
                filters.industry = req.query.industry;
            if (req.query.companyId)
                filters.companyId = req.query.companyId;
            if (req.query.search)
                filters.search = req.query.search;
            if (req.query.valueMin)
                filters.valueMin = parseFloat(req.query.valueMin);
            if (req.query.valueMax)
                filters.valueMax = parseFloat(req.query.valueMax);
            const deals = await dealPipeline_service_1.dealPipelineService.getKanbanData(pipelineId, filters);
            res.json({ success: true, data: deals });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    // ─── MOVE STAGE ─────────────────────────────────────────
    async moveStage(req, res) {
        try {
            const userId = req.user?.id;
            const { toStageId } = req.body;
            if (!toStageId)
                return res.status(400).json({ success: false, message: 'toStageId is required' });
            const deal = await dealPipeline_service_1.dealPipelineService.moveStage(req.params.id, toStageId, userId);
            res.json({ success: true, data: deal });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    // ─── FORECAST ───────────────────────────────────────────
    async getForecast(req, res) {
        try {
            const pipelineId = req.query.pipelineId;
            const data = await dealPipeline_service_1.dealPipelineService.getForecastData(pipelineId);
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    // ─── ANALYTICS ──────────────────────────────────────────
    async getAnalytics(req, res) {
        try {
            const pipelineId = req.query.pipelineId;
            const data = await dealPipeline_service_1.dealPipelineService.getAnalyticsData(pipelineId);
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    // ─── KPIs ───────────────────────────────────────────────
    async getKpis(req, res) {
        try {
            const pipelineId = req.query.pipelineId;
            const data = await dealPipeline_service_1.dealPipelineService.getKPIs(pipelineId);
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    // ─── FUNNEL ─────────────────────────────────────────────
    async getFunnel(req, res) {
        try {
            const pipelineId = req.query.pipelineId;
            const data = await dealPipeline_service_1.dealPipelineService.getFunnelData(pipelineId);
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    // ─── AGING ──────────────────────────────────────────────
    async getAging(req, res) {
        try {
            const pipelineId = req.query.pipelineId;
            const data = await dealPipeline_service_1.dealPipelineService.getAgingData(pipelineId);
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    // ─── PIPELINE HEALTH ───────────────────────────────────
    async getPipelineHealth(req, res) {
        try {
            const pipelineId = req.query.pipelineId;
            const data = await dealPipeline_service_1.dealPipelineService.getPipelineHealth(pipelineId);
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    // ─── QUOTAS ─────────────────────────────────────────────
    async getQuotas(req, res) {
        try {
            const filters = {};
            if (req.query.type)
                filters.type = req.query.type;
            if (req.query.period)
                filters.period = req.query.period;
            if (req.query.employeeId)
                filters.employeeId = req.query.employeeId;
            const data = await dealPipeline_service_1.dealPipelineService.getQuotas(filters);
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async createQuota(req, res) {
        try {
            const userId = req.user?.id;
            const quota = await dealPipeline_service_1.dealPipelineService.createQuota({ ...req.body, createdBy: userId });
            res.status(201).json({ success: true, data: quota });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async updateQuota(req, res) {
        try {
            const userId = req.user?.id;
            const quota = await dealPipeline_service_1.dealPipelineService.updateQuota(req.params.quotaId, { ...req.body, updatedBy: userId });
            res.json({ success: true, data: quota });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async deleteQuota(req, res) {
        try {
            await dealPipeline_service_1.dealPipelineService.deleteQuota(req.params.quotaId);
            res.json({ success: true, message: 'Quota deleted' });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    // ─── TEAM PERFORMANCE ──────────────────────────────────
    async getPerformance(req, res) {
        try {
            const pipelineId = req.query.pipelineId;
            const data = await dealPipeline_service_1.dealPipelineService.getTeamPerformance(pipelineId);
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    // ─── SAVED VIEWS ────────────────────────────────────────
    async getViews(req, res) {
        try {
            const employeeId = req.query.employeeId;
            const data = await dealPipeline_service_1.dealPipelineService.getSavedViews(employeeId);
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async createView(req, res) {
        try {
            const userId = req.user?.id;
            const view = await dealPipeline_service_1.dealPipelineService.createView({ ...req.body, createdBy: userId });
            res.status(201).json({ success: true, data: view });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async deleteView(req, res) {
        try {
            await dealPipeline_service_1.dealPipelineService.deleteView(req.params.viewId);
            res.json({ success: true, message: 'View deleted' });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}
exports.dealPipelineController = new DealPipelineController();
exports.default = exports.dealPipelineController;
