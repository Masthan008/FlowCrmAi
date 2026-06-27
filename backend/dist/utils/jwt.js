"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtUtility = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
exports.JwtUtility = {
    /**
     * Generate an Access Token
     */
    generateAccessToken: (payload) => {
        return jsonwebtoken_1.default.sign(payload, config_1.config.jwt.secret, {
            expiresIn: config_1.config.jwt.expiresIn,
        });
    },
    /**
     * Generate a Refresh Token
     */
    generateRefreshToken: (payload) => {
        return jsonwebtoken_1.default.sign(payload, config_1.config.jwt.refreshSecret, {
            expiresIn: config_1.config.jwt.refreshExpiresIn,
        });
    },
    /**
     * Verify an Access Token
     */
    verifyAccessToken: (token) => {
        return jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
    },
    /**
     * Verify a Refresh Token
     */
    verifyRefreshToken: (token) => {
        return jsonwebtoken_1.default.verify(token, config_1.config.jwt.refreshSecret);
    }
};
exports.default = exports.JwtUtility;
