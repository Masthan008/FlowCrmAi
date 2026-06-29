"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadController = void 0;
const lead_service_1 = require("../service/lead.service");
const leadAutomation_service_1 = require("../service/leadAutomation.service");
const db_1 = require("../../database/db");
const response_1 = require("../../helpers/response");
exports.leadController = {
    /**
     * GET /leads
     */
    list: async (req, res, next) => {
        try {
            const result = await lead_service_1.leadService.list({
                page: req.query.page,
                limit: req.query.limit,
                search: req.query.search,
                status: req.query.status,
                source: req.query.source,
                priority: req.query.priority,
                owner: req.query.owner,
                sortBy: req.query.sortBy,
                sortDir: req.query.sortDir,
            });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Leads retrieved successfully.', result.items, {
                page: result.page,
                limit: result.limit,
                totalItems: result.totalItems,
                totalPages: result.totalPages,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /leads/statistics
     */
    getStatistics: async (req, res, next) => {
        try {
            const data = await lead_service_1.leadService.getStatistics();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead statistics retrieved successfully.', data);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /leads/sources
     */
    getSources: async (req, res, next) => {
        try {
            const data = await lead_service_1.leadService.getSources();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead sources retrieved successfully.', data);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /leads/statuses
     */
    getStatuses: async (req, res, next) => {
        try {
            const data = await lead_service_1.leadService.getStatuses();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead statuses retrieved successfully.', data);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /leads/employees
     */
    getEmployees: async (req, res, next) => {
        try {
            const data = await lead_service_1.leadService.getEmployees();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Employees retrieved successfully.', data);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /leads/:id
     */
    getById: async (req, res, next) => {
        try {
            const lead = await lead_service_1.leadService.getById(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead retrieved successfully.', lead);
        }
        catch (error) {
            if (error.statusCode === 404) {
                response_1.ResponseHelper.sendError(req, res, 404, error.message);
                return;
            }
            next(error);
        }
    },
    /**
     * GET /leads/:id/profile
     */
    getProfile: async (req, res, next) => {
        try {
            const profile = await lead_service_1.leadService.getProfile(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead profile retrieved successfully.', profile);
        }
        catch (error) {
            if (error.statusCode === 404) {
                response_1.ResponseHelper.sendError(req, res, 404, error.message);
                return;
            }
            next(error);
        }
    },
    /**
     * POST /leads
     */
    create: async (req, res, next) => {
        try {
            const lead = await lead_service_1.leadService.create(req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Lead created successfully.', lead);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * PUT /leads/:id
     */
    update: async (req, res, next) => {
        try {
            const lead = await lead_service_1.leadService.update(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead updated successfully.', lead);
        }
        catch (error) {
            if (error.statusCode === 404) {
                response_1.ResponseHelper.sendError(req, res, 404, error.message);
                return;
            }
            next(error);
        }
    },
    /**
     * DELETE /leads/:id
     */
    delete: async (req, res, next) => {
        try {
            await lead_service_1.leadService.delete(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead deleted successfully.');
        }
        catch (error) {
            if (error.statusCode === 404) {
                response_1.ResponseHelper.sendError(req, res, 404, error.message);
                return;
            }
            next(error);
        }
    },
    /**
     * PATCH /leads/:id/status
     */
    updateStatus: async (req, res, next) => {
        try {
            const lead = await lead_service_1.leadService.updateStatus(req.params.id, req.body.statusId, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead status updated successfully.', lead);
        }
        catch (error) {
            if (error.statusCode === 404) {
                response_1.ResponseHelper.sendError(req, res, 404, error.message);
                return;
            }
            next(error);
        }
    },
    /**
     * PATCH /leads/:id/owner
     */
    updateOwner: async (req, res, next) => {
        try {
            const lead = await lead_service_1.leadService.updateOwner(req.params.id, req.body.assignedToId, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead owner updated successfully.', lead);
        }
        catch (error) {
            if (error.statusCode === 404) {
                response_1.ResponseHelper.sendError(req, res, 404, error.message);
                return;
            }
            next(error);
        }
    },
    /**
     * PATCH /leads/:id/priority
     */
    updatePriority: async (req, res, next) => {
        try {
            const lead = await lead_service_1.leadService.updatePriority(req.params.id, req.body.priority, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead priority updated successfully.', lead);
        }
        catch (error) {
            if (error.statusCode === 404) {
                response_1.ResponseHelper.sendError(req, res, 404, error.message);
                return;
            }
            next(error);
        }
    },
    /**
     * PATCH /leads/:id/rating
     */
    updateRating: async (req, res, next) => {
        try {
            const lead = await lead_service_1.leadService.updateRating(req.params.id, req.body.rating, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead rating updated successfully.', lead);
        }
        catch (error) {
            if (error.statusCode === 404) {
                response_1.ResponseHelper.sendError(req, res, 404, error.message);
                return;
            }
            next(error);
        }
    },
    /**
     * GET /leads/search
     */
    search: async (req, res, next) => {
        try {
            const { query, page, limit } = req.query;
            const result = await lead_service_1.leadService.globalSearch({
                query: String(query || ''),
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 20,
            });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Search results retrieved.', result.items, {
                page: result.page,
                limit: result.limit,
                totalItems: result.totalItems,
                totalPages: result.totalPages,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /leads/filter
     */
    filter: async (req, res, next) => {
        try {
            const filters = req.query.filters ? JSON.parse(req.query.filters) : {};
            const { page, limit, sortBy, sortDir } = req.query;
            const result = await lead_service_1.leadService.advancedFilter({
                filters,
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 20,
                sortBy: sortBy,
                sortDir: sortDir,
            });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Filtered leads retrieved.', result.items, {
                page: result.page,
                limit: result.limit,
                totalItems: result.totalItems,
                totalPages: result.totalPages,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * PATCH /leads/bulk-update
     */
    bulkUpdate: async (req, res, next) => {
        try {
            const { ids, statusId, priority, rating, assignedToId, sourceId, industry, tags } = req.body;
            await lead_service_1.leadService.bulkUpdate({
                ids,
                statusId,
                priority,
                rating,
                assignedToId,
                sourceId,
                industry,
                tags,
                userId: req.user?.id,
            });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Bulk update completed successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * PATCH /leads/archive
     */
    archive: async (req, res, next) => {
        try {
            const { ids } = req.body;
            await lead_service_1.leadService.archiveLeads(ids, req.user?.id || 'system');
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Leads archived successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * PATCH /leads/restore
     */
    restore: async (req, res, next) => {
        try {
            const { ids } = req.body;
            await lead_service_1.leadService.restoreLeads(ids);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Leads restored successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /leads/merge
     */
    merge: async (req, res, next) => {
        try {
            const { primaryId, secondaryIds, fieldValues } = req.body;
            await lead_service_1.leadService.mergeLeads({
                primaryId,
                secondaryIds,
                fieldValues,
                userId: req.user?.id || 'system',
            });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Leads merged successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /leads/save-view
     */
    saveView: async (req, res, next) => {
        try {
            const view = await lead_service_1.leadService.saveView(req.user?.id, req.body);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Saved view configuration recorded.', view);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /leads/views
     */
    getViews: async (req, res, next) => {
        try {
            const views = await lead_service_1.leadService.getViews(req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Saved views retrieved.', views);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * DELETE /leads/views/:id
     */
    deleteView: async (req, res, next) => {
        try {
            await lead_service_1.leadService.deleteView(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Saved view configuration removed.');
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /leads/import
     */
    importLeads: async (req, res, next) => {
        try {
            const { fileName, rows, mapping } = req.body;
            const result = await lead_service_1.leadService.importLeads(req.user?.id, fileName, rows, mapping);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'CSV import operation completed successfully.', result);
        }
        catch (error) {
            response_1.ResponseHelper.sendError(req, res, 400, error.message || 'Import transaction failed.');
        }
    },
    /**
     * GET /leads/export
     */
    exportLeads: async (req, res, next) => {
        try {
            const type = req.query.type || 'csv';
            const selectedIds = req.query.selectedIds ? String(req.query.selectedIds).split(',') : undefined;
            const pageLeads = req.query.pageLeads ? String(req.query.pageLeads).split(',') : undefined;
            const filters = req.query.filters ? JSON.parse(req.query.filters) : undefined;
            const leads = await lead_service_1.leadService.exportLeads(req.user?.id, type, {
                selectedIds,
                filters,
                pageLeads,
            });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Export dataset compiled successfully.', leads);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /leads/:id/assign
     */
    /**
     * POST /leads/:id/assign
     */
    assign: async (req, res, next) => {
        try {
            const id = req.params.id;
            const { assignedToId, ruleType, reason } = req.body;
            let lead;
            if (ruleType === 'ROUND_ROBIN' || ruleType === 'LOAD_BASED') {
                lead = await leadAutomation_service_1.leadAutomationService.autoAssignLead(id, ruleType, req.user?.id || 'system');
            }
            else {
                lead = await leadAutomation_service_1.leadAutomationService.assignLead({
                    leadId: id,
                    assignedToId: assignedToId,
                    reason: reason,
                    userId: req.user?.id || 'system',
                });
            }
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead owner assigned successfully.', lead);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /leads/:id/convert
     */
    convert: async (req, res, next) => {
        try {
            const id = req.params.id;
            const result = await leadAutomation_service_1.leadAutomationService.convertLead(id, req.body, req.user?.id || 'system');
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead converted successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /leads/:id/follow-up
     */
    createFollowup: async (req, res, next) => {
        try {
            const id = req.params.id;
            const { type, followupDate, assignedToId, notes, reminderMinutes } = req.body;
            const followup = await db_1.prisma.leadFollowup.create({
                data: {
                    leadId: id,
                    type: type,
                    followupDate: new Date(followupDate),
                    assignedToId: assignedToId,
                    notes: notes,
                    reminderMinutes: reminderMinutes ? Number(reminderMinutes) : 15,
                    createdBy: req.user?.id || 'system',
                },
            });
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Lead follow-up scheduled.', followup);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /leads/:id/follow-ups
     */
    getFollowups: async (req, res, next) => {
        try {
            const id = req.params.id;
            const followups = await db_1.prisma.leadFollowup.findMany({
                where: { leadId: id, deletedAt: null },
                orderBy: { followupDate: 'asc' },
            });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead follow-ups retrieved.', followups);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * PATCH /leads/:id/workflow
     */
    workflow: async (req, res, next) => {
        try {
            const id = req.params.id;
            const { name, trigger, conditions, actions, isActive } = req.body;
            const workflow = await db_1.prisma.leadWorkflow.create({
                data: {
                    leadId: id,
                    name: name,
                    trigger: trigger,
                    conditions: conditions || {},
                    actions: actions || {},
                    isActive: isActive !== false,
                    createdBy: req.user?.id || 'system',
                },
            });
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Lead workflow rule saved.', workflow);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /leads/:id/score
     */
    score: async (req, res, next) => {
        try {
            const id = req.params.id;
            const score = await leadAutomation_service_1.leadAutomationService.calculateLeadScore(id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead score calculated.', score);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /leads/:id/health
     */
    health: async (req, res, next) => {
        try {
            const id = req.params.id;
            const health = await leadAutomation_service_1.leadAutomationService.evaluateLeadHealth(id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead health indicators retrieved.', health);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /leads/:id/sla
     */
    sla: async (req, res, next) => {
        try {
            const id = req.params.id;
            const { responseMinutes } = req.body;
            const sla = await leadAutomation_service_1.leadAutomationService.updateSlaStatus(id, Number(responseMinutes || 0));
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'SLA tracking status updated.', sla);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /leads/:id/approval
     */
    approval: async (req, res, next) => {
        try {
            const id = req.params.id;
            const { type, approverId, comments } = req.body;
            const approval = await db_1.prisma.leadApproval.create({
                data: {
                    leadId: id,
                    type: type,
                    approverId: approverId,
                    comments: comments,
                    status: 'Pending',
                    createdBy: req.user?.id || 'system',
                },
            });
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Approval request submitted.', approval);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * PATCH /leads/:id/reassign
     */
    reassign: async (req, res, next) => {
        try {
            const id = req.params.id;
            const { assignedToId, reason } = req.body;
            const lead = await leadAutomation_service_1.leadAutomationService.assignLead({
                leadId: id,
                assignedToId: assignedToId,
                type: 'Manual Reassign',
                reason: reason || 'Lead Ownership Transfer',
                userId: req.user?.id || 'system',
            });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead ownership reassigned successfully.', lead);
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = exports.leadController;
