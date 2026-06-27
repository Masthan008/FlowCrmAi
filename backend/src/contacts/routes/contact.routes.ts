import { Router } from 'express';
import { contactController } from '../controller/contact.controller';
import { contactNoteController } from '../controller/contactNote.controller';
import { contactActivityController } from '../controller/contactActivity.controller';
import { contactFileController } from '../controller/contactFile.controller';
import { contactTimelineController } from '../controller/contactTimeline.controller';
import { contactHistoryController } from '../controller/contactHistory.controller';
import { contactIntelligenceController } from '../controller/contactIntelligence.controller';

import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';
import { validateRequest } from '../../middlewares/validate';
import { logActivity } from '../../middlewares/activityLogger';

import {
  createContactSchema,
  updateContactSchema,
  bulkUpdateStatusSchema,
  bulkUpdateOwnerSchema,
  getContactByIdSchema,
} from '../validators/contact.validator';

const router = Router();

// All contact routes require authentication
router.use(requireAuth);

// Statistics route (must come before /:id)
router.get(
  '/statistics',
  requirePermission('contacts:view'),
  contactController.getStatistics
);

// Bulk updates
router.patch(
  '/status',
  requirePermission('contacts:edit'),
  validateRequest(bulkUpdateStatusSchema),
  logActivity('contacts', 'CONTACT_BULK_STATUS_UPDATED'),
  contactController.bulkUpdateStatus
);

router.patch(
  '/owner',
  requirePermission('contacts:assign'),
  validateRequest(bulkUpdateOwnerSchema),
  logActivity('contacts', 'CONTACT_BULK_OWNER_UPDATED'),
  contactController.bulkUpdateOwner
);

// CRUD routes
router.get(
  '/',
  requirePermission('contacts:view'),
  contactController.list
);

router.get(
  '/:id',
  requirePermission('contacts:view'),
  validateRequest(getContactByIdSchema),
  logActivity('contacts', 'CONTACT_VIEWED'),
  contactController.getById
);

router.get(
  '/:id/profile',
  requirePermission('contacts:view'),
  validateRequest(getContactByIdSchema),
  contactController.getById
);

router.post(
  '/',
  requirePermission('contacts:create'),
  validateRequest(createContactSchema),
  logActivity('contacts', 'CONTACT_CREATED'),
  contactController.create
);

router.put(
  '/:id',
  requirePermission('contacts:edit'),
  validateRequest(updateContactSchema),
  logActivity('contacts', 'CONTACT_UPDATED'),
  contactController.update
);

router.delete(
  '/:id',
  requirePermission('contacts:delete'),
  validateRequest(getContactByIdSchema),
  logActivity('contacts', 'CONTACT_DELETED'),
  contactController.delete
);

// Notes endpoints
router.get(
  '/:id/notes',
  requirePermission('contacts:view'),
  contactNoteController.list
);
router.post(
  '/:id/notes',
  requirePermission('contacts:notes:create'),
  logActivity('contacts', 'CONTACT_NOTE_CREATED'),
  contactNoteController.create
);
router.put(
  '/:id/notes/:noteId',
  requirePermission('contacts:notes:edit'),
  logActivity('contacts', 'CONTACT_NOTE_UPDATED'),
  contactNoteController.update
);
router.delete(
  '/:id/notes/:noteId',
  requirePermission('contacts:notes:delete'),
  logActivity('contacts', 'CONTACT_NOTE_DELETED'),
  contactNoteController.delete
);

// Activities endpoints
router.get(
  '/:id/activities',
  requirePermission('contacts:view'),
  contactActivityController.list
);
router.post(
  '/:id/activities',
  requirePermission('contacts:activities:create'),
  logActivity('contacts', 'CONTACT_ACTIVITY_CREATED'),
  contactActivityController.create
);
router.put(
  '/:id/activities/:activityId',
  requirePermission('contacts:activities:edit'),
  logActivity('contacts', 'CONTACT_ACTIVITY_UPDATED'),
  contactActivityController.update
);
router.delete(
  '/:id/activities/:activityId',
  requirePermission('contacts:activities:delete'),
  logActivity('contacts', 'CONTACT_ACTIVITY_DELETED'),
  contactActivityController.delete
);

// Files endpoints
router.get(
  '/:id/files',
  requirePermission('contacts:view'),
  contactFileController.list
);
router.post(
  '/:id/files',
  requirePermission('contacts:files:upload'),
  logActivity('contacts', 'CONTACT_FILE_UPLOADED'),
  contactFileController.create
);
router.delete(
  '/:id/files/:fileId',
  requirePermission('contacts:files:delete'),
  logActivity('contacts', 'CONTACT_FILE_DELETED'),
  contactFileController.delete
);

// Timeline log
router.get(
  '/:id/timeline',
  requirePermission('contacts:view'),
  contactTimelineController.list
);

// Audit history
router.get(
  '/:id/history',
  requirePermission('contacts:view'),
  contactHistoryController.list
);

// CRM & Relationship Mapping
router.get(
  '/:id/relationships',
  requirePermission('relationship:view'),
  contactIntelligenceController.getRelationships
);

router.get(
  '/:id/company',
  requirePermission('contacts:view'),
  contactIntelligenceController.getCompany
);

router.get(
  '/:id/deals',
  requirePermission('relationship:view'),
  contactIntelligenceController.getDeals
);

router.get(
  '/:id/journey',
  requirePermission('journey:view'),
  contactIntelligenceController.getJourney
);

// Communication logs
router.get(
  '/:id/communications',
  requirePermission('communication:view'),
  contactIntelligenceController.getCommunications
);

router.get(
  '/:id/calls',
  requirePermission('communication:view'),
  contactIntelligenceController.getCalls
);

router.get(
  '/:id/emails',
  requirePermission('communication:view'),
  contactIntelligenceController.getEmails
);

router.get(
  '/:id/meetings',
  requirePermission('communication:view'),
  contactIntelligenceController.getMeetings
);

// Business Value & Health Dashboards
router.get(
  '/:id/business-value',
  requirePermission('business_metrics:view'),
  contactIntelligenceController.getBusinessValue
);

router.get(
  '/:id/health',
  requirePermission('health:view'),
  contactIntelligenceController.getHealth
);

router.get(
  '/:id/engagement',
  requirePermission('health:view'),
  contactIntelligenceController.getEngagement
);

// Lifecycle
router.get(
  '/:id/lifecycle',
  requirePermission('contacts:view'),
  contactIntelligenceController.getLifecycle
);
router.patch(
  '/:id/lifecycle',
  requirePermission('contacts:lifecycle:manage'),
  logActivity('contacts', 'CONTACT_LIFECYCLE_UPDATED'),
  contactIntelligenceController.updateLifecycle
);

// Preferences
router.get(
  '/:id/preferences',
  requirePermission('contacts:view'),
  contactIntelligenceController.getPreferences
);
router.put(
  '/:id/preferences',
  requirePermission('contacts:preferences:edit'),
  logActivity('contacts', 'CONTACT_PREFERENCES_UPDATED'),
  contactIntelligenceController.updatePreferences
);

// Segmentation & Scoring
router.get(
  '/:id/segments',
  requirePermission('contacts:view'),
  contactIntelligenceController.getSegments
);
router.get(
  '/:id/score',
  requirePermission('contacts:score:view'),
  contactIntelligenceController.getScore
);
router.get(
  '/:id/risk',
  requirePermission('contacts:risk:view'),
  contactIntelligenceController.getRisk
);
router.get(
  '/:id/recommendations',
  requirePermission('contacts:view'),
  contactIntelligenceController.getRecommendations
);

// Follow-ups
router.get(
  '/:id/followups',
  requirePermission('contacts:view'),
  contactIntelligenceController.getFollowups
);
router.post(
  '/:id/followups',
  requirePermission('contacts:activities:create'),
  logActivity('contacts', 'CONTACT_FOLLOWUP_CREATED'),
  contactIntelligenceController.createFollowup
);

// Ownership Reassignment
router.patch(
  '/:id/assign',
  requirePermission('contacts:assign'),
  logActivity('contacts', 'CONTACT_OWNER_ASSIGNED'),
  contactIntelligenceController.assignOwner
);

// Global Tag & Segment Configurations (Without id)
router.post(
  '/contact-tags',
  requirePermission('contacts:edit'),
  contactIntelligenceController.createTag
);

router.get(
  '/contact-segments',
  requirePermission('contacts:segment:manage'),
  contactIntelligenceController.getSegmentsList
);

router.post(
  '/contact-workflows',
  requirePermission('contacts:workflow:manage'),
  contactIntelligenceController.createWorkflow
);

export default router;
