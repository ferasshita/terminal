"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const http_1 = require("../utils/http");
const auth = (req, _res, next) => {
    const bearer = req.headers.authorization;
    if (!bearer?.startsWith('Bearer ')) {
        return next(new http_1.HttpError(401, 'Authentication required'));
    }
    const token = bearer.slice(7);
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        req.user = { id: payload.sub, role: payload.role };
        next();
    }
    catch {
        next(new http_1.HttpError(401, 'Invalid token'));
    }
};
exports.auth = auth;
const authorize = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new http_1.HttpError(401, 'Authentication required'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new http_1.HttpError(403, 'Access denied'));
        }
        next();
    };
};
exports.authorize = authorize;
