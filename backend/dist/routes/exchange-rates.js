"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const pagination_1 = require("../utils/pagination");
const router = (0, express_1.Router)();
const schema = zod_1.z.object({
    currencyCode: zod_1.z.string().min(3).max(3).transform((v) => v.toUpperCase()),
    rate: zod_1.z.coerce.number().positive(),
    type: zod_1.z.nativeEnum(client_1.RateType),
    sourceId: zod_1.z.string().min(1),
});
router.get('/', async (req, res, next) => {
    try {
        const { skip, page, pageSize } = (0, pagination_1.getPagination)(req.query);
        const currencyCode = req.query.currencyCode?.toUpperCase();
        const sourceId = req.query.sourceId;
        const type = req.query.type;
        const fromDate = req.query.fromDate ? new Date(String(req.query.fromDate)) : undefined;
        const toDate = req.query.toDate ? new Date(String(req.query.toDate)) : undefined;
        const where = {
            ...(currencyCode ? { currencyCode } : {}),
            ...(sourceId ? { sourceId } : {}),
            ...(type ? { type } : {}),
            ...(fromDate || toDate
                ? {
                    createdAt: {
                        ...(fromDate ? { gte: fromDate } : {}),
                        ...(toDate ? { lte: toDate } : {}),
                    },
                }
                : {}),
        };
        const [items, total] = await Promise.all([
            prisma_1.prisma.exchangeRate.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: { source: true, currency: true },
            }),
            prisma_1.prisma.exchangeRate.count({ where }),
        ]);
        return res.json({ items, total, page, pageSize });
    }
    catch (error) {
        return next(error);
    }
});
router.post('/', async (req, res, next) => {
    try {
        const payload = schema.parse(req.body);
        const item = await prisma_1.prisma.exchangeRate.create({
            data: payload,
            include: { source: true, currency: true },
        });
        const [latestBuy, latestSell] = await Promise.all([
            prisma_1.prisma.exchangeRate.findFirst({
                where: { currencyCode: payload.currencyCode, sourceId: payload.sourceId, type: client_1.RateType.BUY },
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.prisma.exchangeRate.findFirst({
                where: { currencyCode: payload.currencyCode, sourceId: payload.sourceId, type: client_1.RateType.SELL },
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        if (latestBuy && latestSell) {
            await prisma_1.prisma.historicalRate.create({
                data: {
                    currencyCode: payload.currencyCode,
                    buyRate: latestBuy.rate,
                    sellRate: latestSell.rate,
                    sourceId: payload.sourceId,
                },
            });
        }
        return res.status(201).json(item);
    }
    catch (error) {
        return next(error);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const payload = schema.partial().parse(req.body);
        const item = await prisma_1.prisma.exchangeRate.update({
            where: { id: req.params.id },
            data: payload,
            include: { source: true, currency: true },
        });
        return res.json(item);
    }
    catch (error) {
        return next(error);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        await prisma_1.prisma.exchangeRate.delete({ where: { id: req.params.id } });
        return res.status(204).send();
    }
    catch (error) {
        return next(error);
    }
});
exports.default = router;
