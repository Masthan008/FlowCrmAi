"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Placeholder tasks query route',
        data: []
    });
});
router.post('/', (req, res) => {
    res.status(201).json({
        status: 'success',
        message: 'Placeholder task creation route'
    });
});
exports.default = router;
