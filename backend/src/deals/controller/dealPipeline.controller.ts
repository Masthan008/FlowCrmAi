import { Request, Response } from 'express';
import { dealPipelineService } from '../service/dealPipeline.service';

class DealPipelineController {
  // ─── PIPELINE CRUD ──────────────────────────────────────
  async listPipelines(req: Request, res: Response) {
    try {
      const pipelines = await dealPipelineService.getPipelines();
      res.json({ success: true, data: pipelines });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getPipeline(req: Request, res: Response) {
    try {
      const pipeline = await dealPipelineService.getPipelineById(req.params.pipeId as string);
      if (!pipeline) return res.status(404).json({ success: false, message: 'Pipeline not found' });
      res.json({ success: true, data: pipeline });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async createPipeline(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const pipeline = await dealPipelineService.createPipeline({ ...req.body, createdBy: userId });
      res.status(201).json({ success: true, data: pipeline });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async updatePipeline(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const pipeline = await dealPipelineService.updatePipeline(req.params.pipeId as string, { ...req.body, updatedBy: userId });
      res.json({ success: true, data: pipeline });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async deletePipeline(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      await dealPipelineService.deletePipeline(req.params.pipeId as string, userId);
      res.json({ success: true, message: 'Pipeline deleted' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async duplicatePipeline(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const pipeline = await dealPipelineService.duplicatePipeline(req.params.pipeId as string, userId);
      res.status(201).json({ success: true, data: pipeline });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ─── KANBAN ─────────────────────────────────────────────
  async getKanban(req: Request, res: Response) {
    try {
      const pipelineId = req.query.pipelineId as string | undefined;
      const filters: any = {};
      if (req.query.status) filters.status = req.query.status as string;
      if (req.query.assignedToId) filters.assignedToId = req.query.assignedToId as string;
      if (req.query.priority) filters.priority = req.query.priority as string;
      if (req.query.industry) filters.industry = req.query.industry as string;
      if (req.query.companyId) filters.companyId = req.query.companyId as string;
      if (req.query.search) filters.search = req.query.search as string;
      if (req.query.valueMin) filters.valueMin = parseFloat(req.query.valueMin as string);
      if (req.query.valueMax) filters.valueMax = parseFloat(req.query.valueMax as string);

      const deals = await dealPipelineService.getKanbanData(pipelineId, filters);
      res.json({ success: true, data: deals });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ─── MOVE STAGE ─────────────────────────────────────────
  async moveStage(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { toStageId } = req.body;
      if (!toStageId) return res.status(400).json({ success: false, message: 'toStageId is required' });
      const deal = await dealPipelineService.moveStage(req.params.id as string, toStageId, userId);
      res.json({ success: true, data: deal });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ─── FORECAST ───────────────────────────────────────────
  async getForecast(req: Request, res: Response) {
    try {
      const pipelineId = req.query.pipelineId as string | undefined;
      const data = await dealPipelineService.getForecastData(pipelineId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ─── ANALYTICS ──────────────────────────────────────────
  async getAnalytics(req: Request, res: Response) {
    try {
      const pipelineId = req.query.pipelineId as string | undefined;
      const data = await dealPipelineService.getAnalyticsData(pipelineId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ─── KPIs ───────────────────────────────────────────────
  async getKpis(req: Request, res: Response) {
    try {
      const pipelineId = req.query.pipelineId as string | undefined;
      const data = await dealPipelineService.getKPIs(pipelineId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ─── FUNNEL ─────────────────────────────────────────────
  async getFunnel(req: Request, res: Response) {
    try {
      const pipelineId = req.query.pipelineId as string | undefined;
      const data = await dealPipelineService.getFunnelData(pipelineId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ─── AGING ──────────────────────────────────────────────
  async getAging(req: Request, res: Response) {
    try {
      const pipelineId = req.query.pipelineId as string | undefined;
      const data = await dealPipelineService.getAgingData(pipelineId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ─── PIPELINE HEALTH ───────────────────────────────────
  async getPipelineHealth(req: Request, res: Response) {
    try {
      const pipelineId = req.query.pipelineId as string | undefined;
      const data = await dealPipelineService.getPipelineHealth(pipelineId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ─── QUOTAS ─────────────────────────────────────────────
  async getQuotas(req: Request, res: Response) {
    try {
      const filters: any = {};
      if (req.query.type) filters.type = req.query.type as string;
      if (req.query.period) filters.period = req.query.period as string;
      if (req.query.employeeId) filters.employeeId = req.query.employeeId as string;
      const data = await dealPipelineService.getQuotas(filters);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async createQuota(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const quota = await dealPipelineService.createQuota({ ...req.body, createdBy: userId });
      res.status(201).json({ success: true, data: quota });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async updateQuota(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const quota = await dealPipelineService.updateQuota(req.params.quotaId as string, { ...req.body, updatedBy: userId });
      res.json({ success: true, data: quota });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async deleteQuota(req: Request, res: Response) {
    try {
      await dealPipelineService.deleteQuota(req.params.quotaId as string);
      res.json({ success: true, message: 'Quota deleted' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ─── TEAM PERFORMANCE ──────────────────────────────────
  async getPerformance(req: Request, res: Response) {
    try {
      const pipelineId = req.query.pipelineId as string | undefined;
      const data = await dealPipelineService.getTeamPerformance(pipelineId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ─── SAVED VIEWS ────────────────────────────────────────
  async getViews(req: Request, res: Response) {
    try {
      const employeeId = req.query.employeeId as string | undefined;
      const data = await dealPipelineService.getSavedViews(employeeId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async createView(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const view = await dealPipelineService.createView({ ...req.body, createdBy: userId });
      res.status(201).json({ success: true, data: view });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async deleteView(req: Request, res: Response) {
    try {
      await dealPipelineService.deleteView(req.params.viewId as string);
      res.json({ success: true, message: 'View deleted' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const dealPipelineController = new DealPipelineController();
export default dealPipelineController;
