"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_1 = require("../../helpers/response");
const auth_1 = require("../../middlewares/auth");
const role_repository_1 = require("../../settings/repository/role.repository");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
// GET all available permissions
router.get('/', async (req, res, next) => {
    try {
        const permissions = await role_repository_1.roleRepository.listPermissions();
        response_1.ResponseHelper.sendSuccess(req, res, 200, 'Permissions retrieved successfully', permissions);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
