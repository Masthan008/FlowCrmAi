"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealPipelineService = exports.DealPipelineService = void 0;
const dealPipeline_repository_1 = require("../repository/dealPipeline.repository");
class DealPipelineService {
    // ─── PIPELINE CRUD ──────────────────────────────────────
    async getPipelines() {
        return dealPipeline_repository_1.dealPipelineRepository.getPipelines();
    }
    async getPipelineById(id) {
        return dealPipeline_repository_1.dealPipelineRepository.getPipelineById(id);
    }
    async createPipeline(data) {
        return dealPipeline_repository_1.dealPipelineRepository.createPipeline(data);
    }
    async updatePipeline(id, data) {
        return dealPipeline_repository_1.dealPipelineRepository.updatePipeline(id, data);
    }
    async deletePipeline(id, deletedBy) {
        return dealPipeline_repository_1.dealPipelineRepository.deletePipeline(id, deletedBy);
    }
    async duplicatePipeline(id, createdBy) {
        return dealPipeline_repository_1.dealPipelineRepository.duplicatePipeline(id, createdBy);
    }
    // ─── KANBAN ─────────────────────────────────────────────
    async getKanbanData(pipelineId, filters) {
        return dealPipeline_repository_1.dealPipelineRepository.getKanbanData(pipelineId, filters);
    }
    // ─── STAGE MOVE ─────────────────────────────────────────
    async moveStage(dealId, toStageId, movedBy) {
        return dealPipeline_repository_1.dealPipelineRepository.moveStage(dealId, toStageId, movedBy);
    }
    // ─── FORECAST ───────────────────────────────────────────
    async getForecastData(pipelineId) {
        return dealPipeline_repository_1.dealPipelineRepository.getForecastData(pipelineId);
    }
    // ─── ANALYTICS ──────────────────────────────────────────
    async getAnalyticsData(pipelineId) {
        return dealPipeline_repository_1.dealPipelineRepository.getAnalyticsData(pipelineId);
    }
    // ─── KPIs ───────────────────────────────────────────────
    async getKPIs(pipelineId) {
        return dealPipeline_repository_1.dealPipelineRepository.getKPIs(pipelineId);
    }
    // ─── FUNNEL ─────────────────────────────────────────────
    async getFunnelData(pipelineId) {
        return dealPipeline_repository_1.dealPipelineRepository.getFunnelData(pipelineId);
    }
    // ─── AGING ──────────────────────────────────────────────
    async getAgingData(pipelineId) {
        return dealPipeline_repository_1.dealPipelineRepository.getAgingData(pipelineId);
    }
    // ─── PIPELINE HEALTH ───────────────────────────────────
    async getPipelineHealth(pipelineId) {
        return dealPipeline_repository_1.dealPipelineRepository.getPipelineHealth(pipelineId);
    }
    // ─── QUOTAS ─────────────────────────────────────────────
    async getQuotas(filters) {
        return dealPipeline_repository_1.dealPipelineRepository.getQuotas(filters);
    }
    async createQuota(data) {
        return dealPipeline_repository_1.dealPipelineRepository.createQuota(data);
    }
    async updateQuota(id, data) {
        return dealPipeline_repository_1.dealPipelineRepository.updateQuota(id, data);
    }
    async deleteQuota(id) {
        return dealPipeline_repository_1.dealPipelineRepository.deleteQuota(id);
    }
    // ─── TEAM PERFORMANCE ──────────────────────────────────
    async getTeamPerformance(pipelineId) {
        return dealPipeline_repository_1.dealPipelineRepository.getTeamPerformance(pipelineId);
    }
    // ─── SAVED VIEWS ────────────────────────────────────────
    async getSavedViews(employeeId) {
        return dealPipeline_repository_1.dealPipelineRepository.getSavedViews(employeeId);
    }
    async createView(data) {
        return dealPipeline_repository_1.dealPipelineRepository.createView(data);
    }
    async deleteView(id) {
        return dealPipeline_repository_1.dealPipelineRepository.deleteView(id);
    }
}
exports.DealPipelineService = DealPipelineService;
exports.dealPipelineService = new DealPipelineService();
exports.default = exports.dealPipelineService;
