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
    }
};
