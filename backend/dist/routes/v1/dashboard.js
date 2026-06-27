"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Placeholder dashboard overview route',
        data: {
            metrics: { leads: 1482, deals: 184, pipeline: 845900 }
        }
    });
});
exports.default = router;
