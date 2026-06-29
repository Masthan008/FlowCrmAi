"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentController = void 0;
const department_service_1 = require("../service/department.service");
const response_1 = require("../../helpers/response");
exports.departmentController = {
    list: async (req, res, next) => {
        try {
            const departments = await department_service_1.departmentService.getDepartments(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Departments retrieved successfully.', departments);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const dept = await department_service_1.departmentService.createDepartment(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Department created successfully.', dept);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const dept = await department_service_1.departmentService.updateDepartment(req.params.deptId, req.body, req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Department updated successfully.', dept);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await department_service_1.departmentService.deleteDepartment(req.params.deptId, req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Department deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
};
