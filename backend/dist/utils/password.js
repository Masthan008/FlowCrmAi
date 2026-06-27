"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordUtility = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.PasswordUtility = {
    /**
     * Hash a plain text password
     * @param password Plain password string
     * @returns Hashed string
     */
    hashPassword: async (password) => {
        const saltRounds = 12; // Secure strength
        return bcrypt_1.default.hash(password, saltRounds);
    },
    /**
     * Verify password string against a hash
     * @param password Plain password
     * @param hash Database hash
     * @returns boolean
     */
    verifyPassword: async (password, hash) => {
        return bcrypt_1.default.compare(password, hash);
    },
    /**
     * Check password strength requirements:
     * - Must contain at least one uppercase letter
     * - Must contain at least one lowercase letter
     * - Must contain at least one number
     * - Must contain at least one special character (@$!%*?&_#)
     * - Must be at least 8 characters long
     */
    validatePasswordStrength: (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#])[A-Za-z\d@$!%*?&_#]{8,}$/;
        return regex.test(password);
    }
};
exports.default = exports.PasswordUtility;
