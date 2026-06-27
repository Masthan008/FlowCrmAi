"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlaceholderRouter = void 0;
const express_1 = require("express");
const response_1 = require("../../helpers/response");
/**
 * Creates an Express Router with boilerplate placeholder endpoints
 */
const createPlaceholderRouter = (moduleName) => {
    const router = (0, express_1.Router)();
    // GET list
    router.get('/', (req, res) => {
        response_1.ResponseHelper.sendSuccess(req, res, 200, `Placeholder response: GET list of ${moduleName}`, {
            items: [],
            message: `Database logic for ${moduleName} is not yet implemented.`
        });
    });
    // POST create
    router.post('/', (req, res) => {
        response_1.ResponseHelper.sendSuccess(req, res, 201, `Placeholder response: POST create ${moduleName}`, {
            created: true,
            body: req.body
        });
    });
    // GET details
    router.get('/:id', (req, res) => {
        response_1.ResponseHelper.sendSuccess(req, res, 200, `Placeholder response: GET details of ${moduleName}`, {
            id: req.params.id
        });
    });
    // PUT update
    router.put('/:id', (req, res) => {
        response_1.ResponseHelper.sendSuccess(req, res, 200, `Placeholder response: PUT update ${moduleName}`, {
            id: req.params.id,
            updated: true
        });
    });
    // DELETE soft-delete
    router.delete('/:id', (req, res) => {
        response_1.ResponseHelper.sendSuccess(req, res, 200, `Placeholder response: DELETE soft-delete ${moduleName}`, {
            id: req.params.id,
            deleted: true
        });
    });
    return router;
};
exports.createPlaceholderRouter = createPlaceholderRouter;
exports.default = exports.createPlaceholderRouter;
