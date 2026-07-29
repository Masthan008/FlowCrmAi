"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webform_controller_1 = require("../controller/webform.controller");
const router = (0, express_1.Router)();
router.post('/:id/submit', webform_controller_1.webFormController.submitPublic);
exports.default = router;
