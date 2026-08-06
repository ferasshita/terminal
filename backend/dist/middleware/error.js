"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const http_1 = require("../utils/http");
const errorHandler = (error, _req, res, _next) => {
    if (error instanceof zod_1.ZodError) {
        return res.status(400).json({
            message: 'Validation failed',
            issues: error.issues,
        });
    }
    if (error instanceof http_1.HttpError) {
        return res.status(error.status).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Unexpected server error' });
};
exports.errorHandler = errorHandler;
