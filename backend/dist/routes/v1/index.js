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
// Generate placeholder routers for all 20 remaining CRM infrastructure modules
const placeholderModules = [
    'users',
    'roles',
    'permissions',
    'customers',
    'contacts',
    'companies',
    'deals',
    'activities',
    'tasks',
    'calendar',
    'meetings',
    'products',
    'quotes',
    'invoices',
    'payments',
    'notifications',
    'reports',
    'analytics',
    'settings'
];
placeholderModules.forEach((moduleName) => {
    router.use(`/${moduleName}`, (0, placeholder_1.createPlaceholderRouter)(moduleName));
});
exports.default = router;
