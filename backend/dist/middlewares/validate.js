"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const response_1 = require("../helpers/response");
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            // Validate body, query, and params as defined in schema
            const parsed = (await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            }));
            // Re-assign validated properties back to the request
            // Use Object.defineProperty to handle getter-only properties in Node.js 21+
            Object.defineProperty(req, 'body', { value: parsed.body, writable: true, configurable: true });
            Object.defineProperty(req, 'query', { value: parsed.query, writable: true, configurable: true });
            Object.defineProperty(req, 'params', { value: parsed.params, writable: true, configurable: true });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errorsList = error.issues.map((issue) => ({
                    field: issue.path.slice(1).join('.'), // Remove 'body', 'query', or 'params' root label
                    message: issue.message,
                }));
                res.status(400);
                response_1.ResponseHelper.sendError(req, res, 400, 'Request validation failed', errorsList);
                return;
            }
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
exports.default = exports.validateRequest;
