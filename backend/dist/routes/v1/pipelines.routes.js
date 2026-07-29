"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_1 = require("../../helpers/response");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
let defaultPipelines = [
    {
        id: 'default-pipeline-1',
        name: 'Standard Sales Pipeline',
        description: 'Main enterprise B2B sales cycle',
        isDefault: true,
        stages: [
            { id: 'stg-1', name: 'Qualification', probability: 20, order: 1 },
            { id: 'stg-2', name: 'Discovery', probability: 40, order: 2 },
            { id: 'stg-3', name: 'Proposal / Demo', probability: 60, order: 3 },
            { id: 'stg-4', name: 'Negotiation / Legal', probability: 80, order: 4 },
            { id: 'stg-5', name: 'Closed Won', probability: 100, order: 5 },
            { id: 'stg-6', name: 'Closed Lost', probability: 0, order: 6 },
        ],
    },
];
// GET list pipelines
router.get('/', (req, res) => {
    response_1.ResponseHelper.sendSuccess(req, res, 200, 'Pipelines retrieved successfully', defaultPipelines);
});
// POST create pipeline
router.post('/', (req, res) => {
    const { name, description, stages } = req.body;
    const newPipeline = {
        id: `pipeline-${Date.now()}`,
        name: name || 'Custom Pipeline',
        description: description || '',
        isDefault: false,
        stages: stages || [],
    };
    defaultPipelines.push(newPipeline);
    response_1.ResponseHelper.sendSuccess(req, res, 201, 'Pipeline created successfully', newPipeline);
});
// PUT update pipeline
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const index = defaultPipelines.findIndex((p) => p.id === id);
    if (index === -1) {
        return response_1.ResponseHelper.sendError(req, res, 404, 'Pipeline not found');
    }
    defaultPipelines[index] = {
        ...defaultPipelines[index],
        ...req.body,
    };
    response_1.ResponseHelper.sendSuccess(req, res, 200, 'Pipeline updated successfully', defaultPipelines[index]);
});
// DELETE pipeline
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    defaultPipelines = defaultPipelines.filter((p) => p.id !== id);
    response_1.ResponseHelper.sendSuccess(req, res, 200, 'Pipeline deleted successfully');
});
exports.default = router;
