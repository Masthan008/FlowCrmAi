"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_1 = require("../../helpers/response");
const auth_1 = require("../../middlewares/auth");
const settings_repository_1 = require("../../settings/repository/settings.repository");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
// GET workspace settings
router.get('/', async (req, res, next) => {
    try {
        const settings = await settings_repository_1.settingsRepository.getSettings();
        response_1.ResponseHelper.sendSuccess(req, res, 200, 'System settings retrieved successfully', settings);
    }
    catch (error) {
        next(error);
    }
});
// PUT update workspace settings
router.put('/', async (req, res, next) => {
    try {
        const updated = await settings_repository_1.settingsRepository.updateSettings(req.body);
        response_1.ResponseHelper.sendSuccess(req, res, 200, 'System settings updated successfully', updated);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
