"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controller/dashboard.controller");
const auth_1 = require("../../middlewares/auth");
const dashboard_validator_1 = require("../validators/dashboard.validator");
const router = (0, express_1.Router)();
// Apply requireAuth validation to all routes
router.get('/overview', auth_1.requireAuth, dashboard_controller_1.dashboardController.getOverview);
router.get('/charts', auth_1.requireAuth, dashboard_controller_1.dashboardController.getCharts);
router.get('/activities', auth_1.requireAuth, dashboard_controller_1.dashboardController.getActivities);
router.get('/tasks', auth_1.requireAuth, dashboard_controller_1.dashboardController.getTasks);
router.get('/deals', auth_1.requireAuth, dashboard_controller_1.dashboardController.getDeals);
// Advanced BI endpoints
router.get('/business-overview', auth_1.requireAuth, dashboard_validator_1.validateTimeframe, dashboard_controller_1.dashboardController.getBusinessOverview);
router.get('/pipeline', auth_1.requireAuth, dashboard_validator_1.validateTimeframe, dashboard_controller_1.dashboardController.getPipeline);
router.get('/revenue', auth_1.requireAuth, dashboard_controller_1.dashboardController.getRevenue);
router.get('/team', auth_1.requireAuth, dashboard_controller_1.dashboardController.getTeam);
router.get('/goals', auth_1.requireAuth, dashboard_controller_1.dashboardController.getGoals);
router.get('/health', auth_1.requireAuth, dashboard_controller_1.dashboardController.getHealth);
router.get('/calendar-preview', auth_1.requireAuth, dashboard_controller_1.dashboardController.getCalendarPreview);
exports.default = router;
