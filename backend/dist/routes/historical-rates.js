"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const pagination_1 = require("../utils/pagination");
const router = (0, express_1.Router)();
router.get('/', async (req, res, next) => {
    try {
        const { skip, page, pageSize } = (0, pagination_1.getPagination)(req.query);
        const currencyCode = req.query.currencyCode?.toUpperCase();
        const sourceId = req.query.sourceId;
        const fromDate = req.query.fromDate ? new Date(String(req.query.fromDate)) : undefined;
        const toDate = req.query.toDate ? new Date(String(req.query.toDate)) : undefined;
        const where = {
            ...(currencyCode ? { currencyCode } : {}),
            ...(sourceId ? { sourceId } : {}),
            ...(fromDate || toDate
                ? {
                    recordedAt: {
                        ...(fromDate ? { gte: fromDate } : {}),
                        ...(toDate ? { lte: toDate } : {}),
                    },
                }
                : {}),
        };
        const [items, total] = await Promise.all([
            prisma_1.prisma.historicalRate.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { recordedAt: 'desc' },
                include: { source: true, currency: true },
            }),
            prisma_1.prisma.historicalRate.count({ where }),
        ]);
        return res.json({ items, total, page, pageSize });
    }
    catch (error) {
        return next(error);
    }
});
exports.default = router;
