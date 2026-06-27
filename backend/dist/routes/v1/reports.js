"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Placeholder reports query route',
        data: []
    });
});
exports.default = router;
