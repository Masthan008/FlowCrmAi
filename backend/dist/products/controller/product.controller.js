"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productController = void 0;
const product_service_1 = require("../service/product.service");
const response_1 = require("../../helpers/response");
exports.productController = {
    list: async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
            const search = req.query.search;
            const categoryId = req.query.categoryId;
            const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
            const result = await product_service_1.productService.getProducts({ page, limit, search, categoryId, isActive });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Products retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            const product = await product_service_1.productService.getProductById(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Product details retrieved successfully.', product);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const product = await product_service_1.productService.createProduct(req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Product created successfully.', product);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const product = await product_service_1.productService.updateProduct(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Product updated successfully.', product);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await product_service_1.productService.deleteProduct(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Product deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    listCategories: async (req, res, next) => {
        try {
            const categories = await product_service_1.productService.getCategories();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Product categories retrieved successfully.', categories);
        }
        catch (error) {
            next(error);
        }
    },
    createCategory: async (req, res, next) => {
        try {
            const category = await product_service_1.productService.createCategory(req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Product category created successfully.', category);
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = exports.productController;
