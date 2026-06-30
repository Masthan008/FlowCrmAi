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
// Custom routes
router.use('/auth', auth_1.default);
router.use('/dashboard', dashboard_routes_1.default);
router.use('/leads', lead_routes_1.default);
router.use('/tasks', task_routes_1.default);
router.use('/contacts', contact_routes_1.default);
router.use('/companies', company_routes_1.default);
router.use('/companies', companyIntelligence_routes_1.default);
router.use('/deals', deal_routes_1.default);
router.get('/deal-workflows', auth_2.requireAuth, (0, permission_1.requirePermission)('deals:workflows:manage'), dealAutomation_controller_1.dealAutomationController.getWorkflows);
router.post('/deal-workflows', auth_2.requireAuth, (0, permission_1.requirePermission)('deals:workflows:manage'), dealAutomation_controller_1.dealAutomationController.createWorkflow);
// Generate placeholder routers for all remaining CRM infrastructure modules
const placeholderModules = [
    'users',
    'roles',
    'permissions',
    'customers',
    'activities',
    'calendar',
    'meetings',
    'products',
    'quotes',
    'invoices',
    'payments',
    'notifications',
    'reports',
    'analytics',
    'settings',
    'pipelines'
];
placeholderModules.forEach((moduleName) => {
    router.use(`/${moduleName}`, (0, placeholder_1.createPlaceholderRouter)(moduleName));
});
exports.default = router;
