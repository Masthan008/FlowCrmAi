"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignController = void 0;
const campaign_service_1 = require("../service/campaign.service");
const response_1 = require("../../helpers/response");
exports.campaignController = {
    list: async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
            const search = req.query.search;
            const status = req.query.status;
            const type = req.query.type;
            const result = await campaign_service_1.campaignService.getCampaigns({ page, limit, search, status, type });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Campaigns retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            const campaign = await campaign_service_1.campaignService.getCampaignById(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Campaign details retrieved successfully.', campaign);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const campaign = await campaign_service_1.campaignService.createCampaign(req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Campaign created successfully.', campaign);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const campaign = await campaign_service_1.campaignService.updateCampaign(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Campaign updated successfully.', campaign);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await campaign_service_1.campaignService.deleteCampaign(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Campaign deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    launch: async (req, res, next) => {
        try {
            const campaign = await campaign_service_1.campaignService.updateCampaignStatus(req.params.id, 'Running', req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Campaign launched successfully.', campaign);
        }
        catch (error) {
            next(error);
        }
    },
    pause: async (req, res, next) => {
        try {
            const campaign = await campaign_service_1.campaignService.updateCampaignStatus(req.params.id, 'Paused', req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Campaign paused successfully.', campaign);
        }
        catch (error) {
            next(error);
        }
    },
    getAnalytics: async (req, res, next) => {
        try {
            const analytics = await campaign_service_1.campaignService.getCampaignAnalytics(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Campaign analytics retrieved successfully.', analytics);
        }
        catch (error) {
            next(error);
        }
    },
    getLists: async (req, res, next) => {
        try {
            const lists = await campaign_service_1.campaignService.getCampaignLists(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Campaign lists retrieved successfully.', lists);
        }
        catch (error) {
            next(error);
        }
    },
    createList: async (req, res, next) => {
        try {
            const list = await campaign_service_1.campaignService.createCampaignList(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Campaign list created successfully.', list);
        }
        catch (error) {
            next(error);
        }
    },
    deleteList: async (req, res, next) => {
        try {
            await campaign_service_1.campaignService.deleteCampaignList(req.params.id, req.params.listId, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Campaign list deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    getEmails: async (req, res, next) => {
        try {
            const emails = await campaign_service_1.campaignService.getCampaignEmails(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Campaign emails retrieved successfully.', emails);
        }
        catch (error) {
            next(error);
        }
    },
    createEmail: async (req, res, next) => {
        try {
            const email = await campaign_service_1.campaignService.createCampaignEmail(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Campaign email created successfully.', email);
        }
        catch (error) {
            next(error);
        }
    },
    updateEmail: async (req, res, next) => {
        try {
            const email = await campaign_service_1.campaignService.updateCampaignEmail(req.params.id, req.params.emailId, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Campaign email updated successfully.', email);
        }
        catch (error) {
            next(error);
        }
    },
    deleteEmail: async (req, res, next) => {
        try {
            await campaign_service_1.campaignService.deleteCampaignEmail(req.params.id, req.params.emailId, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Campaign email deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = exports.campaignController;
