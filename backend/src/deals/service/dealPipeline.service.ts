import { dealPipelineRepository } from '../repository/dealPipeline.repository';

export class DealPipelineService {
  // ─── PIPELINE CRUD ──────────────────────────────────────
  async getPipelines() {
    return dealPipelineRepository.getPipelines();
  }

  async getPipelineById(id: string) {
    return dealPipelineRepository.getPipelineById(id);
  }

  async createPipeline(data: any) {
    return dealPipelineRepository.createPipeline(data);
  }

  async updatePipeline(id: string, data: any) {
    return dealPipelineRepository.updatePipeline(id, data);
  }

  async deletePipeline(id: string, deletedBy?: string) {
    return dealPipelineRepository.deletePipeline(id, deletedBy);
  }

  async duplicatePipeline(id: string, createdBy?: string) {
    return dealPipelineRepository.duplicatePipeline(id, createdBy);
  }

  // ─── KANBAN ─────────────────────────────────────────────
  async getKanbanData(pipelineId?: string, filters?: any) {
    return dealPipelineRepository.getKanbanData(pipelineId, filters);
  }

  // ─── STAGE MOVE ─────────────────────────────────────────
  async moveStage(dealId: string, toStageId: string, movedBy?: string) {
    return dealPipelineRepository.moveStage(dealId, toStageId, movedBy);
  }

  // ─── FORECAST ───────────────────────────────────────────
  async getForecastData(pipelineId?: string) {
    return dealPipelineRepository.getForecastData(pipelineId);
  }

  // ─── ANALYTICS ──────────────────────────────────────────
  async getAnalyticsData(pipelineId?: string) {
    return dealPipelineRepository.getAnalyticsData(pipelineId);
  }

  // ─── KPIs ───────────────────────────────────────────────
  async getKPIs(pipelineId?: string) {
    return dealPipelineRepository.getKPIs(pipelineId);
  }

  // ─── FUNNEL ─────────────────────────────────────────────
  async getFunnelData(pipelineId?: string) {
    return dealPipelineRepository.getFunnelData(pipelineId);
  }

  // ─── AGING ──────────────────────────────────────────────
  async getAgingData(pipelineId?: string) {
    return dealPipelineRepository.getAgingData(pipelineId);
  }

  // ─── PIPELINE HEALTH ───────────────────────────────────
  async getPipelineHealth(pipelineId?: string) {
    return dealPipelineRepository.getPipelineHealth(pipelineId);
  }

  // ─── QUOTAS ─────────────────────────────────────────────
  async getQuotas(filters?: any) {
    return dealPipelineRepository.getQuotas(filters);
  }

  async createQuota(data: any) {
    return dealPipelineRepository.createQuota(data);
  }

  async updateQuota(id: string, data: any) {
    return dealPipelineRepository.updateQuota(id, data);
  }

  async deleteQuota(id: string) {
    return dealPipelineRepository.deleteQuota(id);
  }

  // ─── TEAM PERFORMANCE ──────────────────────────────────
  async getTeamPerformance(pipelineId?: string) {
    return dealPipelineRepository.getTeamPerformance(pipelineId);
  }

  // ─── SAVED VIEWS ────────────────────────────────────────
  async getSavedViews(employeeId?: string) {
    return dealPipelineRepository.getSavedViews(employeeId);
  }

  async createView(data: any) {
    return dealPipelineRepository.createView(data);
  }

  async deleteView(id: string) {
    return dealPipelineRepository.deleteView(id);
  }
}

export const dealPipelineService = new DealPipelineService();
export default dealPipelineService;
