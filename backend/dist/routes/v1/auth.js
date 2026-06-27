"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../../controllers/auth.controller");
const auth_1 = require("../../middlewares/auth");
const rateLimiter_1 = require("../../middlewares/rateLimiter");
const router = (0, express_1.Router)();
// Rate limited public auth routes
router.post('/register', rateLimiter_1.authRateLimiter, auth_controller_1.authController.register);
router.post('/login', rateLimiter_1.authRateLimiter, auth_controller_1.authController.login);
router.post('/forgot-password', rateLimiter_1.authRateLimiter, auth_controller_1.authController.forgotPassword);
router.post('/reset-password', rateLimiter_1.authRateLimiter, auth_controller_1.authController.resetPassword);
// Public token session controls
router.post('/refresh', auth_controller_1.authController.refresh);
router.post('/logout', auth_controller_1.authController.logout);
// Protected profile management
router.get('/me', auth_1.requireAuth, auth_controller_1.authController.me);
router.put('/profile', auth_1.requireAuth, auth_controller_1.authController.updateProfile);
router.put('/change-password', auth_1.requireAuth, auth_controller_1.authController.changePassword);
// Protected session/device tracking
router.get('/sessions', auth_1.requireAuth, auth_controller_1.authController.getSessions);
router.delete('/sessions/:id', auth_1.requireAuth, auth_controller_1.authController.logoutSession);
router.delete('/sessions', auth_1.requireAuth, auth_controller_1.authController.logoutAllSessions);
exports.default = router;
