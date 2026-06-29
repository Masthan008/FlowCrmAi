"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = require("../config");
// Ensure upload directory exists
if (!fs_1.default.existsSync(config_1.config.uploadPath)) {
    fs_1.default.mkdirSync(config_1.config.uploadPath, { recursive: true });
}
// Setup local storage engine configuration
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config_1.config.uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp + original extension
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path_1.default.extname(file.originalname)}`);
    }
});
// Setup file filters
const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.csv', '.xlsx', '.zip'];
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    }
    else {
        cb(new Error(`File type is not supported. Allowed formats: ${allowedExtensions.join(', ')}`));
    }
};
// Expose multer upload configurations
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB maximum size
    }
});
exports.default = exports.upload;
