"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const pagination_1 = require("../utils/pagination");
const router = (0, express_1.Router)();
const schema = zod_1.z.object({
    title: zod_1.z.string().min(2),
    content: zod_1.z.string().min(2),
    category: zod_1.z.string().min(2),
    countryCode: zod_1.z.string().min(2),
    currencyCode: zod_1.z.string().min(3).max(3).transform((v) => v.toUpperCase()),
    importance: zod_1.z.nativeEnum(client_1.Importance),
    sourceId: zod_1.z.string().min(1),
    publishedAt: zod_1.z.coerce.date().optional(),
});
router.get('/', async (req, res, next) => {
    try {
        const { skip, page, pageSize } = (0, pagination_1.getPagination)(req.query);
        const countryCode = req.query.countryCode;
        const currencyCode = req.query.currencyCode?.toUpperCase();
        const category = req.query.category;
        const importance = req.query.importance;
        const where = {
            ...(countryCode ? { countryCode } : {}),
            ...(currencyCode ? { currencyCode } : {}),
            ...(category ? { category: { contains: category, mode: 'insensitive' } } : {}),
            ...(importance ? { importance } : {}),
        };
        const [items, total] = await Promise.all([
            prisma_1.prisma.news.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { publishedAt: 'desc' },
                include: { source: true, currency: true },
            }),
            prisma_1.prisma.news.count({ where }),
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
        const item = await prisma_1.prisma.news.create({ data: payload, include: { source: true, currency: true } });
        return res.status(201).json(item);
    }
    catch (error) {
        return next(error);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const payload = schema.partial().parse(req.body);
        const item = await prisma_1.prisma.news.update({
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
        await prisma_1.prisma.news.delete({ where: { id: req.params.id } });
        return res.status(204).send();
    }
    catch (error) {
        return next(error);
    }
});
exports.default = router;
