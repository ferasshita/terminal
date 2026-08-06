"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPagination = void 0;
const http_1 = require("./http");
const getPagination = (query) => {
    const page = Math.max(1, (0, http_1.toNumber)(query.page, 1));
    const pageSize = Math.min(100, Math.max(1, (0, http_1.toNumber)(query.pageSize, 20)));
    return {
        page,
        pageSize,
        skip: (page - 1) * pageSize,
    };
};
exports.getPagination = getPagination;
