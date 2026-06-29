"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contact_controller_1 = require("../controller/contact.controller");
const contactNote_controller_1 = require("../controller/contactNote.controller");
const contactActivity_controller_1 = require("../controller/contactActivity.controller");
const contactFile_controller_1 = require("../controller/contactFile.controller");
const contactTimeline_controller_1 = require("../controller/contactTimeline.controller");
const contactHistory_controller_1 = require("../controller/contactHistory.controller");
const contactIntelligence_controller_1 = require("../controller/contactIntelligence.controller");
const auth_1 = require("../../middlewares/auth");
const permission_1 = require("../../middlewares/permission");
const validate_1 = require("../../middlewares/validate");
const activityLogger_1 = require("../../middlewares/activityLogger");
const contact_validator_1 = require("../validators/contact.validator");
const router = (0, express_1.Router)();
// All contact routes require authentication
router.use(auth_1.requireAuth);
// Statistics route (must come before /:id)
router.get('/statistics', (0, permission_1.requirePermission)('contacts:view'), contact_controller_1.contactController.getStatistics);
// Bulk updates
router.patch('/status', (0, permission_1.requirePermission)('contacts:edit'), (0, validate_1.validateRequest)(contact_validator_1.bulkUpdateStatusSchema), (0, activityLogger_1.logActivity)('contacts', 'CONTACT_BULK_STATUS_UPDATED'), contact_controller_1.contactController.bulkUpdateStatus);
router.patch('/owner', (0, permission_1.requirePermission)('contacts:assign'), (0, validate_1.validateRequest)(contact_validator_1.bulkUpdateOwnerSchema), (0, activityLogger_1.logActivity)('contacts', 'CONTACT_BULK_OWNER_UPDATED'), contact_controller_1.contactController.bulkUpdateOwner);
// CRUD routes
router.get('/', (0, permission_1.requirePermission)('contacts:view'), contact_controller_1.contactController.list);
router.get('/:id', (0, permission_1.requirePermission)('contacts:view'), (0, validate_1.validateRequest)(contact_validator_1.getContactByIdSchema), (0, activityLogger_1.logActivity)('contacts', 'CONTACT_VIEWED'), contact_controller_1.contactController.getById);
router.get('/:id/profile', (0, permission_1.requirePermission)('contacts:view'), (0, validate_1.validateRequest)(contact_validator_1.getContactByIdSchema), contact_controller_1.contactController.getById);
router.post('/', (0, permission_1.requirePermission)('contacts:create'), (0, validate_1.validateRequest)(contact_validator_1.createContactSchema), (0, activityLogger_1.logActivity)('contacts', 'CONTACT_CREATED'), contact_controller_1.contactController.create);
router.put('/:id', (0, permission_1.requirePermission)('contacts:edit'), (0, validate_1.validateRequest)(contact_validator_1.updateContactSchema), (0, activityLogger_1.logActivity)('contacts', 'CONTACT_UPDATED'), contact_controller_1.contactController.update);
router.delete('/:id', (0, permission_1.requirePermission)('contacts:delete'), (0, validate_1.validateRequest)(contact_validator_1.getContactByIdSchema), (0, activityLogger_1.logActivity)('contacts', 'CONTACT_DELETED'), contact_controller_1.contactController.delete);
// Notes endpoints
router.get('/:id/notes', (0, permission_1.requirePermission)('contacts:view'), contactNote_controller_1.contactNoteController.list);
router.post('/:id/notes', (0, permission_1.requirePermission)('contacts:notes:create'), (0, activityLogger_1.logActivity)('contacts', 'CONTACT_NOTE_CREATED'), contactNote_controller_1.contactNoteController.create);
router.put('/:id/notes/:noteId', (0, permission_1.requirePermission)('contacts:notes:edit'), (0, activityLogger_1.logActivity)('contacts', 'CONTACT_NOTE_UPDATED'), contactNote_controller_1.contactNoteController.update);
router.delete('/:id/notes/:noteId', (0, permission_1.requirePermission)('contacts:notes:delete'), (0, activityLogger_1.logActivity)('contacts', 'CONTACT_NOTE_DELETED'), contactNote_controller_1.contactNoteController.delete);
// Activities endpoints
router.get('/:id/activities', (0, permission_1.requirePermission)('contacts:view'), contactActivity_controller_1.contactActivityController.list);
router.post('/:id/activities', (0, permission_1.requirePermission)('contacts:activities:create'), (0, activityLogger_1.logActivity)('contacts', 'CONTACT_ACTIVITY_CREATED'), contactActivity_controller_1.contactActivityController.create);
router.put('/:id/activities/:activityId', (0, permission_1.requirePermission)('contacts:activities:edit'), (0, activityLogger_1.logActivity)('contacts', 'CONTACT_ACTIVITY_UPDATED'), contactActivity_controller_1.contactActivityController.update);
router.delete('/:id/activities/:activityId', (0, permission_1.requirePermission)('contacts:activities:delete'), (0, activityLogger_1.logActivity)('contacts', 'CONTACT_ACTIVITY_DELETED'), contactActivity_controller_1.contactActivityController.delete);
// Files endpoints
router.get('/:id/files', (0, permission_1.requirePermission)('contacts:view'), contactFile_controller_1.contactFileController.list);
router.post('/:id/files', (0, permission_1.requirePermission)('contacts:files:upload'), (0, activityLogger_1.logActivity)('contacts', 'CONTACT_FILE_UPLOADED'), contactFile_controller_1.contactFileController.create);
router.delete('/:id/files/:fileId', (0, permission_1.requirePermission)('contacts:files:delete'), (0, activityLogger_1.logActivity)('contacts', 'CONTACT_FILE_DELETED'), contactFile_controller_1.contactFileController.delete);
// Timeline log
router.get('/:id/timeline', (0, permission_1.requirePermission)('contacts:view'), contactTimeline_controller_1.contactTimelineController.list);
// Audit history
router.get('/:id/history', (0, permission_1.requirePermission)('contacts:view'), contactHistory_controller_1.contactHistoryController.list);
// CRM & Relationship Mapping
router.get('/:id/relationships', (0, permission_1.requirePermission)('relationship:view'), contactIntelligence_controller_1.contactIntelligenceController.getRelationships);
router.get('/:id/company', (0, permission_1.requirePermission)('contacts:view'), contactIntelligence_controller_1.contactIntelligenceController.getCompany);
router.get('/:id/deals', (0, permission_1.requirePermission)('relationship:view'), contactIntelligence_controller_1.contactIntelligenceController.getDeals);
router.get('/:id/journey', (0, permission_1.requirePermission)('journey:view'), contactIntelligence_controller_1.contactIntelligenceController.getJourney);
// Communication logs
router.get('/:id/communications', (0, permission_1.requirePermission)('communication:view'), contactIntelligence_controller_1.contactIntelligenceController.getCommunications);
router.get('/:id/calls', (0, permission_1.requirePermission)('communication:view'), contactIntelligence_controller_1.contactIntelligenceController.getCalls);
router.get('/:id/emails', (0, permission_1.requirePermission)('communication:view'), contactIntelligence_controller_1.contactIntelligenceController.getEmails);
router.get('/:id/meetings', (0, permission_1.requirePermission)('communication:view'), contactIntelligence_controller_1.contactIntelligenceController.getMeetings);
// Business Value & Health Dashboards
router.get('/:id/business-value', (0, permission_1.requirePermission)('business_metrics:view'), contactIntelligence_controller_1.contactIntelligenceController.getBusinessValue);
router.get('/:id/health', (0, permission_1.requirePermission)('health:view'), contactIntelligence_controller_1.contactIntelligenceController.getHealth);
router.get('/:id/engagement', (0, permission_1.requirePermission)('health:view'), contactIntelligence_controller_1.contactIntelligenceController.getEngagement);
// Lifecycle
router.get('/:id/lifecycle', (0, permission_1.requirePermission)('contacts:view'), contactIntelligence_controller_1.contactIntelligenceController.getLifecycle);
router.patch('/:id/lifecycle', (0, permission_1.requirePermission)('contacts:lifecycle:manage'), (0, activityLogger_1.logActivity)('contacts', 'CONTACT_LIFECYCLE_UPDATED'), contactIntelligence_controller_1.contactIntelligenceController.updateLifecycle);
// Preferences
router.get('/:id/preferences', (0, permission_1.requirePermission)('contacts:view'), contactIntelligence_controller_1.contactIntelligenceController.getPreferences);
router.put('/:id/preferences', (0, permission_1.requirePermission)('contacts:preferences:edit'), (0, activityLogger_1.logActivity)('contacts', 'CONTACT_PREFERENCES_UPDATED'), contactIntelligence_controller_1.contactIntelligenceController.updatePreferences);
// Segmentation & Scoring
router.get('/:id/segments', (0, permission_1.requirePermission)('contacts:view'), contactIntelligence_controller_1.contactIntelligenceController.getSegments);
router.get('/:id/score', (0, permission_1.requirePermission)('contacts:score:view'), contactIntelligence_controller_1.contactIntelligenceController.getScore);
router.get('/:id/risk', (0, permission_1.requirePermission)('contacts:risk:view'), contactIntelligence_controller_1.contactIntelligenceController.getRisk);
router.get('/:id/recommendations', (0, permission_1.requirePermission)('contacts:view'), contactIntelligence_controller_1.contactIntelligenceController.getRecommendations);
// Follow-ups
router.get('/:id/followups', (0, permission_1.requirePermission)('contacts:view'), contactIntelligence_controller_1.contactIntelligenceController.getFollowups);
router.post('/:id/followups', (0, permission_1.requirePermission)('contacts:activities:create'), (0, activityLogger_1.logActivity)('contacts', 'CONTACT_FOLLOWUP_CREATED'), contactIntelligence_controller_1.contactIntelligenceController.createFollowup);
// Ownership Reassignment
router.patch('/:id/assign', (0, permission_1.requirePermission)('contacts:assign'), (0, activityLogger_1.logActivity)('contacts', 'CONTACT_OWNER_ASSIGNED'), contactIntelligence_controller_1.contactIntelligenceController.assignOwner);
// Global Tag & Segment Configurations (Without id)
router.post('/contact-tags', (0, permission_1.requirePermission)('contacts:edit'), contactIntelligence_controller_1.contactIntelligenceController.createTag);
router.get('/contact-segments', (0, permission_1.requirePermission)('contacts:segment:manage'), contactIntelligence_controller_1.contactIntelligenceController.getSegmentsList);
router.post('/contact-workflows', (0, permission_1.requirePermission)('contacts:workflow:manage'), contactIntelligence_controller_1.contactIntelligenceController.createWorkflow);
exports.default = router;
