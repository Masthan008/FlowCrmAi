import { Router } from 'express';
import { companyIntelligenceController } from '../controller/companyIntelligence.controller';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { logActivity } from '../../middlewares/activityLogger';
import {
  updateLifecycleSchema, getScoreSchema, getHealthSchema, getRiskSchema,
  createSegmentSchema, updateSegmentSchema,
  createTagSchema, updateTagSchema, assignTagsSchema,
  createWorkflowSchema, updateWorkflowSchema,
  createRecommendationSchema, createFollowupSchema, updateFollowupSchema,
  listQuerySchema,
} from '../validators/companyIntelligence.validator';

const router = Router();

router.use(requireAuth);

// === Lifecycle ===
router.get('/:id/lifecycle', requirePermission('companies:intelligence:view'), companyIntelligenceController.getLifecycle);
router.patch('/:id/lifecycle', requirePermission('companies:intelligence:manage'), validateRequest(updateLifecycleSchema), logActivity('companies', 'LIFECYCLE_UPDATED'), companyIntelligenceController.updateLifecycle);
router.get('/:id/lifecycle/history', requirePermission('companies:intelligence:view'), companyIntelligenceController.getStageHistory);

// === Score ===
router.get('/:id/score', requirePermission('companies:intelligence:view'), companyIntelligenceController.getScore);
router.post('/:id/score/calculate', requirePermission('companies:intelligence:manage'), logActivity('companies', 'SCORE_CALCULATED'), companyIntelligenceController.calculateScore);

// === Health ===
router.get('/:id/health', requirePermission('companies:intelligence:view'), companyIntelligenceController.getHealth);
router.post('/:id/health/calculate', requirePermission('companies:intelligence:manage'), logActivity('companies', 'HEALTH_CALCULATED'), companyIntelligenceController.calculateHealth);

// === Risk ===
router.get('/:id/risk', requirePermission('companies:intelligence:view'), companyIntelligenceController.getRisk);
router.post('/:id/risk/calculate', requirePermission('companies:intelligence:manage'), logActivity('companies', 'RISK_CALCULATED'), companyIntelligenceController.calculateRisk);

// === Segments ===
router.get('/company-segments', requirePermission('companies:segments:view'), companyIntelligenceController.listSegments);
router.post('/company-segments', requirePermission('companies:segments:create'), validateRequest(createSegmentSchema), logActivity('companies', 'SEGMENT_CREATED'), companyIntelligenceController.createSegment);
router.get('/company-segments/:id', requirePermission('companies:segments:view'), companyIntelligenceController.getSegment);
router.put('/company-segments/:id', requirePermission('companies:segments:edit'), validateRequest(updateSegmentSchema), logActivity('companies', 'SEGMENT_UPDATED'), companyIntelligenceController.updateSegment);
router.delete('/company-segments/:id', requirePermission('companies:segments:delete'), logActivity('companies', 'SEGMENT_DELETED'), companyIntelligenceController.deleteSegment);
router.post('/company-segments/:id/evaluate', requirePermission('companies:segments:view'), companyIntelligenceController.evaluateSegment);

// === Tags ===
router.get('/company-tags', requirePermission('companies:tags:view'), companyIntelligenceController.listTags);
router.post('/company-tags', requirePermission('companies:tags:create'), validateRequest(createTagSchema), logActivity('companies', 'TAG_CREATED'), companyIntelligenceController.createTag);
router.put('/company-tags/:id', requirePermission('companies:tags:edit'), validateRequest(updateTagSchema), logActivity('companies', 'TAG_UPDATED'), companyIntelligenceController.updateTag);
router.delete('/company-tags/:id', requirePermission('companies:tags:delete'), logActivity('companies', 'TAG_DELETED'), companyIntelligenceController.deleteTag);

// === Company-Tag Assignment ===
router.get('/:id/tags', requirePermission('companies:intelligence:view'), companyIntelligenceController.getCompanyTags);
router.post('/:id/tags', requirePermission('companies:tags:create'), validateRequest(assignTagsSchema), logActivity('companies', 'TAGS_ASSIGNED'), companyIntelligenceController.assignTagsToCompany);
router.delete('/:id/tags/:tagId', requirePermission('companies:tags:delete'), logActivity('companies', 'TAG_REMOVED'), companyIntelligenceController.removeTagFromCompany);

// === Workflows ===
router.get('/company-workflows', requirePermission('companies:workflows:view'), companyIntelligenceController.listWorkflows);
router.post('/company-workflows', requirePermission('companies:workflows:create'), validateRequest(createWorkflowSchema), logActivity('companies', 'WORKFLOW_CREATED'), companyIntelligenceController.createWorkflow);
router.put('/company-workflows/:id', requirePermission('companies:workflows:edit'), validateRequest(updateWorkflowSchema), logActivity('companies', 'WORKFLOW_UPDATED'), companyIntelligenceController.updateWorkflow);
router.delete('/company-workflows/:id', requirePermission('companies:workflows:delete'), logActivity('companies', 'WORKFLOW_DELETED'), companyIntelligenceController.deleteWorkflow);

// === Recommendations ===
router.get('/:id/recommendations', requirePermission('companies:intelligence:view'), companyIntelligenceController.listRecommendations);
router.post('/:id/recommendations', requirePermission('companies:recommendations:manage'), validateRequest(createRecommendationSchema), logActivity('companies', 'RECOMMENDATION_CREATED'), companyIntelligenceController.createRecommendation);
router.patch('/:id/recommendations/:recId/read', requirePermission('companies:intelligence:view'), companyIntelligenceController.markRecommendationRead);
router.patch('/:id/recommendations/:recId/action', requirePermission('companies:recommendations:manage'), logActivity('companies', 'RECOMMENDATION_ACTIONED'), companyIntelligenceController.markRecommendationActioned);

// === Follow-ups ===
router.get('/:id/followups', requirePermission('companies:intelligence:view'), companyIntelligenceController.listFollowups);
router.post('/:id/followups', requirePermission('companies:followups:manage'), validateRequest(createFollowupSchema), logActivity('companies', 'FOLLOWUP_CREATED'), companyIntelligenceController.createFollowup);
router.put('/:id/followups/:followupId', requirePermission('companies:followups:manage'), validateRequest(updateFollowupSchema), logActivity('companies', 'FOLLOWUP_UPDATED'), companyIntelligenceController.updateFollowup);
router.delete('/:id/followups/:followupId', requirePermission('companies:followups:manage'), logActivity('companies', 'FOLLOWUP_DELETED'), companyIntelligenceController.deleteFollowup);

// === Insights & Analytics ===
router.get('/company-insights', requirePermission('companies:intelligence:view'), companyIntelligenceController.getInsights);
router.get('/company-analytics', requirePermission('companies:intelligence:view'), companyIntelligenceController.getAnalytics);

export default router;
