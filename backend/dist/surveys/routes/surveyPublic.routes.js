"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const survey_controller_1 = require("../controller/survey.controller");
const router = (0, express_1.Router)();
router.post('/:id/submit', survey_controller_1.surveyController.submitPublic);
exports.default = router;
