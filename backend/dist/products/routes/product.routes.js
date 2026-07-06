"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controller/product.controller");
const auth_1 = require("../../middlewares/auth");
const permission_1 = require("../../middlewares/permission");
const validate_1 = require("../../middlewares/validate");
const product_validator_1 = require("../validators/product.validator");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
// Categories
router.get('/categories', (0, permission_1.requirePermission)('products:view'), product_controller_1.productController.listCategories);
router.post('/categories', (0, permission_1.requirePermission)('products:create'), (0, validate_1.validateRequest)(product_validator_1.createCategorySchema), product_controller_1.productController.createCategory);
// Products
router.get('/', (0, permission_1.requirePermission)('products:view'), product_controller_1.productController.list);
router.get('/:id', (0, permission_1.requirePermission)('products:view'), product_controller_1.productController.getById);
router.post('/', (0, permission_1.requirePermission)('products:create'), (0, validate_1.validateRequest)(product_validator_1.createProductSchema), product_controller_1.productController.create);
router.put('/:id', (0, permission_1.requirePermission)('products:edit'), (0, validate_1.validateRequest)(product_validator_1.updateProductSchema), product_controller_1.productController.update);
router.delete('/:id', (0, permission_1.requirePermission)('products:delete'), product_controller_1.productController.delete);
exports.default = router;
