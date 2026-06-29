"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const companyIntelligence_controller_1 = require("../controller/companyIntelligence.controller");
const auth_1 = require("../../middlewares/auth");
const permission_1 = require("../../middlewares/permission");
const validate_1 = require("../../middlewares/validate");
const activityLogger_1 = require("../../middlewares/activityLogger");
const companyIntelligence_validator_1 = require("../validators/companyIntelligence.validator");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
// === Lifecycle ===
router.get('/:id/lifecycle', (0, permission_1.requirePermission)('companies:intelligence:view'), companyIntelligence_controller_1.companyIntelligenceController.getLifecycle);
router.patch('/:id/lifecycle', (0, permission_1.requirePermission)('companies:intelligence:manage'), (0, validate_1.validateRequest)(companyIntelligence_validator_1.updateLifecycleSchema), (0, activityLogger_1.logActivity)('companies', 'LIFECYCLE_UPDATED'), companyIntelligence_controller_1.companyIntelligenceController.updateLifecycle);
router.get('/:id/lifecycle/history', (0, permission_1.requirePermission)('companies:intelligence:view'), companyIntelligence_controller_1.companyIntelligenceController.getStageHistory);
// === Score ===
router.get('/:id/score', (0, permission_1.requirePermission)('companies:intelligence:view'), companyIntelligence_controller_1.companyIntelligenceController.getScore);
router.post('/:id/score/calculate', (0, permission_1.requirePermission)('companies:intelligence:manage'), (0, activityLogger_1.logActivity)('companies', 'SCORE_CALCULATED'), companyIntelligence_controller_1.companyIntelligenceController.calculateScore);
// === Health ===
router.get('/:id/health', (0, permission_1.requirePermission)('companies:intelligence:view'), companyIntelligence_controller_1.companyIntelligenceController.getHealth);
router.post('/:id/health/calculate', (0, permission_1.requirePermission)('companies:intelligence:manage'), (0, activityLogger_1.logActivity)('companies', 'HEALTH_CALCULATED'), companyIntelligence_controller_1.companyIntelligenceController.calculateHealth);
// === Risk ===
router.get('/:id/risk', (0, permission_1.requirePermission)('companies:intelligence:view'), companyIntelligence_controller_1.companyIntelligenceController.getRisk);
router.post('/:id/risk/calculate', (0, permission_1.requirePermission)('companies:intelligence:manage'), (0, activityLogger_1.logActivity)('companies', 'RISK_CALCULATED'), companyIntelligence_controller_1.companyIntelligenceController.calculateRisk);
// === Segments ===
router.get('/company-segments', (0, permission_1.requirePermission)('companies:segments:view'), companyIntelligence_controller_1.companyIntelligenceController.listSegments);
router.post('/company-segments', (0, permission_1.requirePermission)('companies:segments:create'), (0, validate_1.validateRequest)(companyIntelligence_validator_1.createSegmentSchema), (0, activityLogger_1.logActivity)('companies', 'SEGMENT_CREATED'), companyIntelligence_controller_1.companyIntelligenceController.createSegment);
router.get('/company-segments/:id', (0, permission_1.requirePermission)('companies:segments:view'), companyIntelligence_controller_1.companyIntelligenceController.getSegment);
router.put('/company-segments/:id', (0, permission_1.requirePermission)('companies:segments:edit'), (0, validate_1.validateRequest)(companyIntelligence_validator_1.updateSegmentSchema), (0, activityLogger_1.logActivity)('companies', 'SEGMENT_UPDATED'), companyIntelligence_controller_1.companyIntelligenceController.updateSegment);
router.delete('/company-segments/:id', (0, permission_1.requirePermission)('companies:segments:delete'), (0, activityLogger_1.logActivity)('companies', 'SEGMENT_DELETED'), companyIntelligence_controller_1.companyIntelligenceController.deleteSegment);
router.post('/company-segments/:id/evaluate', (0, permission_1.requirePermission)('companies:segments:view'), companyIntelligence_controller_1.companyIntelligenceController.evaluateSegment);
// === Tags ===
router.get('/company-tags', (0, permission_1.requirePermission)('companies:tags:view'), companyIntelligence_controller_1.companyIntelligenceController.listTags);
router.post('/company-tags', (0, permission_1.requirePermission)('companies:tags:create'), (0, validate_1.validateRequest)(companyIntelligence_validator_1.createTagSchema), (0, activityLogger_1.logActivity)('companies', 'TAG_CREATED'), companyIntelligence_controller_1.companyIntelligenceController.createTag);
router.put('/company-tags/:id', (0, permission_1.requirePermission)('companies:tags:edit'), (0, validate_1.validateRequest)(companyIntelligence_validator_1.updateTagSchema), (0, activityLogger_1.logActivity)('companies', 'TAG_UPDATED'), companyIntelligence_controller_1.companyIntelligenceController.updateTag);
router.delete('/company-tags/:id', (0, permission_1.requirePermission)('companies:tags:delete'), (0, activityLogger_1.logActivity)('companies', 'TAG_DELETED'), companyIntelligence_controller_1.companyIntelligenceController.deleteTag);
// === Company-Tag Assignment ===
router.get('/:id/tags', (0, permission_1.requirePermission)('companies:intelligence:view'), companyIntelligence_controller_1.companyIntelligenceController.getCompanyTags);
router.post('/:id/tags', (0, permission_1.requirePermission)('companies:tags:create'), (0, validate_1.validateRequest)(companyIntelligence_validator_1.assignTagsSchema), (0, activityLogger_1.logActivity)('companies', 'TAGS_ASSIGNED'), companyIntelligence_controller_1.companyIntelligenceController.assignTagsToCompany);
router.delete('/:id/tags/:tagId', (0, permission_1.requirePermission)('companies:tags:delete'), (0, activityLogger_1.logActivity)('companies', 'TAG_REMOVED'), companyIntelligence_controller_1.companyIntelligenceController.removeTagFromCompany);
// === Workflows ===
router.get('/company-workflows', (0, permission_1.requirePermission)('companies:workflows:view'), companyIntelligence_controller_1.companyIntelligenceController.listWorkflows);
router.post('/company-workflows', (0, permission_1.requirePermission)('companies:workflows:create'), (0, validate_1.validateRequest)(companyIntelligence_validator_1.createWorkflowSchema), (0, activityLogger_1.logActivity)('companies', 'WORKFLOW_CREATED'), companyIntelligence_controller_1.companyIntelligenceController.createWorkflow);
router.put('/company-workflows/:id', (0, permission_1.requirePermission)('companies:workflows:edit'), (0, validate_1.validateRequest)(companyIntelligence_validator_1.updateWorkflowSchema), (0, activityLogger_1.logActivity)('companies', 'WORKFLOW_UPDATED'), companyIntelligence_controller_1.companyIntelligenceController.updateWorkflow);
router.delete('/company-workflows/:id', (0, permission_1.requirePermission)('companies:workflows:delete'), (0, activityLogger_1.logActivity)('companies', 'WORKFLOW_DELETED'), companyIntelligence_controller_1.companyIntelligenceController.deleteWorkflow);
// === Recommendations ===
router.get('/:id/recommendations', (0, permission_1.requirePermission)('companies:intelligence:view'), companyIntelligence_controller_1.companyIntelligenceController.listRecommendations);
router.post('/:id/recommendations', (0, permission_1.requirePermission)('companies:recommendations:manage'), (0, validate_1.validateRequest)(companyIntelligence_validator_1.createRecommendationSchema), (0, activityLogger_1.logActivity)('companies', 'RECOMMENDATION_CREATED'), companyIntelligence_controller_1.companyIntelligenceController.createRecommendation);
router.patch('/:id/recommendations/:recId/read', (0, permission_1.requirePermission)('companies:intelligence:view'), companyIntelligence_controller_1.companyIntelligenceController.markRecommendationRead);
router.patch('/:id/recommendations/:recId/action', (0, permission_1.requirePermission)('companies:recommendations:manage'), (0, activityLogger_1.logActivity)('companies', 'RECOMMENDATION_ACTIONED'), companyIntelligence_controller_1.companyIntelligenceController.markRecommendationActioned);
// === Follow-ups ===
router.get('/:id/followups', (0, permission_1.requirePermission)('companies:intelligence:view'), companyIntelligence_controller_1.companyIntelligenceController.listFollowups);
router.post('/:id/followups', (0, permission_1.requirePermission)('companies:followups:manage'), (0, validate_1.validateRequest)(companyIntelligence_validator_1.createFollowupSchema), (0, activityLogger_1.logActivity)('companies', 'FOLLOWUP_CREATED'), companyIntelligence_controller_1.companyIntelligenceController.createFollowup);
router.put('/:id/followups/:followupId', (0, permission_1.requirePermission)('companies:followups:manage'), (0, validate_1.validateRequest)(companyIntelligence_validator_1.updateFollowupSchema), (0, activityLogger_1.logActivity)('companies', 'FOLLOWUP_UPDATED'), companyIntelligence_controller_1.companyIntelligenceController.updateFollowup);
router.delete('/:id/followups/:followupId', (0, permission_1.requirePermission)('companies:followups:manage'), (0, activityLogger_1.logActivity)('companies', 'FOLLOWUP_DELETED'), companyIntelligence_controller_1.companyIntelligenceController.deleteFollowup);
// === Insights & Analytics ===
router.get('/company-insights', (0, permission_1.requirePermission)('companies:intelligence:view'), companyIntelligence_controller_1.companyIntelligenceController.getInsights);
router.get('/company-analytics', (0, permission_1.requirePermission)('companies:intelligence:view'), companyIntelligence_controller_1.companyIntelligenceController.getAnalytics);
exports.default = router;
