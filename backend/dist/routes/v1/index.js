"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../database/db");
const config_1 = require("../../config");
const placeholder_1 = require("./placeholder");
const auth_1 = __importDefault(require("./auth"));
const dashboard_routes_1 = __importDefault(require("../../dashboard/routes/dashboard.routes"));
const lead_routes_1 = __importDefault(require("../../leads/routes/lead.routes"));
const task_routes_1 = __importDefault(require("../../tasks/routes/task.routes"));
const contact_routes_1 = __importDefault(require("../../contacts/routes/contact.routes"));
const company_routes_1 = __importDefault(require("../../companies/routes/company.routes"));
const companyIntelligence_routes_1 = __importDefault(require("../../companies/routes/companyIntelligence.routes"));
const deal_routes_1 = __importDefault(require("../../deals/routes/deal.routes"));
const dealAutomation_controller_1 = require("../../deals/controller/dealAutomation.controller");
const auth_2 = require("../../middlewares/auth");
const permission_1 = require("../../middlewares/permission");
const product_routes_1 = __importDefault(require("../../products/routes/product.routes"));
const meeting_routes_1 = __importDefault(require("../../meetings/routes/meeting.routes"));
const quote_routes_1 = __importDefault(require("../../quotes/routes/quote.routes"));
const invoice_routes_1 = __importDefault(require("../../invoices/routes/invoice.routes"));
const search_controller_1 = require("../../controllers/search.controller");
const webform_routes_1 = __importDefault(require("../../webforms/routes/webform.routes"));
const webformPublic_routes_1 = __importDefault(require("../../webforms/routes/webformPublic.routes"));
const portal_routes_1 = __importDefault(require("../../portal/routes/portal.routes"));
const portalAuth_routes_1 = __importDefault(require("../../portal/routes/portalAuth.routes"));
const chat_routes_1 = __importDefault(require("../../chat/routes/chat.routes"));
const expense_routes_1 = __importDefault(require("../../expenses/routes/expense.routes"));
const asset_routes_1 = __importDefault(require("../../assets/routes/asset.routes"));
const gdpr_routes_1 = __importDefault(require("../../gdpr/routes/gdpr.routes"));
const survey_routes_1 = __importDefault(require("../../surveys/routes/survey.routes"));
const surveyPublic_routes_1 = __importDefault(require("../../surveys/routes/surveyPublic.routes"));
const commission_routes_1 = __importDefault(require("../../commissions/routes/commission.routes"));
const campaign_routes_1 = __importDefault(require("../../campaigns/routes/campaign.routes"));
const ticket_routes_1 = __importDefault(require("../../tickets/routes/ticket.routes"));
const knowledge_routes_1 = __importDefault(require("../../knowledge/routes/knowledge.routes"));
const contract_routes_1 = __importDefault(require("../../contracts/routes/contract.routes"));
const order_routes_1 = __importDefault(require("../../orders/routes/order.routes"));
const project_routes_1 = __importDefault(require("../../projects/routes/project.routes"));
const subscription_routes_1 = __importDefault(require("../../subscriptions/routes/subscription.routes"));
const email_routes_1 = __importDefault(require("../../email/routes/email.routes"));
const router = (0, express_1.Router)();
// Health check endpoint
router.get('/health', async (req, res) => {
    const dbConnected = await db_1.db.checkConnection();
    res.json({
        success: true,
        statusCode: 200,
        message: 'Health status retrieved successfully',
        data: {
            api: 'healthy',
            database: dbConnected ? 'connected' : 'disconnected',
            version: config_1.config.appName + ' v' + config_1.config.appVersion,
            environment: config_1.config.env,
            serverTime: new Date().toISOString(),
            uptime: `${process.uptime().toFixed(2)}s`
        },
        timestamp: new Date().toISOString(),
        requestId: req.requestId || 'unknown'
    });
});
const activities_routes_1 = __importDefault(require("./activities.routes"));
const reports_routes_1 = __importDefault(require("./reports.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const notifications_routes_1 = __importDefault(require("./notifications.routes"));
const settings_routes_1 = __importDefault(require("./settings.routes"));
const roles_routes_1 = __importDefault(require("./roles.routes"));
const permissions_routes_1 = __importDefault(require("./permissions.routes"));
const pipelines_routes_1 = __importDefault(require("./pipelines.routes"));
// Custom routes
router.use('/auth', auth_1.default);
router.use('/dashboard', dashboard_routes_1.default);
router.use('/leads', lead_routes_1.default);
router.use('/tasks', task_routes_1.default);
router.use('/contacts', contact_routes_1.default);
router.use('/companies', companyIntelligence_routes_1.default);
router.use('/companies', company_routes_1.default);
router.use('/deals', deal_routes_1.default);
router.use('/activities', activities_routes_1.default);
router.use('/reports', reports_routes_1.default);
router.use('/analytics', reports_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/notifications', notifications_routes_1.default);
router.use('/settings', settings_routes_1.default);
router.use('/roles', roles_routes_1.default);
router.use('/permissions', permissions_routes_1.default);
router.use('/pipelines', pipelines_routes_1.default);
router.use('/products', product_routes_1.default);
router.use('/meetings', meeting_routes_1.default);
router.use('/quotes', quote_routes_1.default);
router.use('/invoices', invoice_routes_1.default);
router.use('/webforms', webform_routes_1.default);
router.use('/forms/public', webformPublic_routes_1.default);
router.use('/portal', portal_routes_1.default);
router.use('/portal/auth', portalAuth_routes_1.default);
router.use('/chat', chat_routes_1.default);
router.use('/expenses', expense_routes_1.default);
router.use('/assets', asset_routes_1.default);
router.use('/gdpr', gdpr_routes_1.default);
router.use('/surveys', survey_routes_1.default);
router.use('/surveys/public', surveyPublic_routes_1.default);
router.use('/campaigns', campaign_routes_1.default);
router.use('/tickets', ticket_routes_1.default);
router.use('/knowledge', knowledge_routes_1.default);
router.use('/contracts', contract_routes_1.default);
router.use('/orders', order_routes_1.default);
router.use('/projects', project_routes_1.default);
router.use('/subscriptions', subscription_routes_1.default);
router.use('/email', email_routes_1.default);
router.use('/commissions', commission_routes_1.default);
router.get('/global-search', auth_2.requireAuth, search_controller_1.searchController.globalSearch);
router.get('/deal-workflows', auth_2.requireAuth, (0, permission_1.requirePermission)('deals:workflows:manage'), dealAutomation_controller_1.dealAutomationController.getWorkflows);
router.post('/deal-workflows', auth_2.requireAuth, (0, permission_1.requirePermission)('deals:workflows:manage'), dealAutomation_controller_1.dealAutomationController.createWorkflow);
// Generate placeholder routers for all remaining CRM infrastructure modules
const placeholderModules = [
    'customers',
    'calendar',
    'payments'
];
placeholderModules.forEach((moduleName) => {
    router.use(`/${moduleName}`, (0, placeholder_1.createPlaceholderRouter)(moduleName));
});
exports.default = router;
