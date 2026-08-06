"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const pagination_1 = require("../utils/pagination");
const router = (0, express_1.Router)();
const schema = zod_1.z.object({
    code: zod_1.z.string().min(3).max(3).transform((v) => v.toUpperCase()),
    name: zod_1.z.string().min(2),
    symbol: zod_1.z.string().min(1),
    country: zod_1.z.string().min(2),
    flag: zod_1.z.string().min(1),
    isActive: zod_1.z.boolean().optional().default(true),
});
router.get('/', async (req, res, next) => {
    try {
        const { page, pageSize, skip } = (0, pagination_1.getPagination)(req.query);
        const query = req.query.q?.trim();
        const where = query
            ? {
                OR: [
                    { code: { contains: query, mode: 'insensitive' } },
                    { name: { contains: query, mode: 'insensitive' } },
                    { country: { contains: query, mode: 'insensitive' } },
                ],
            }
            : undefined;
        const [items, total] = await Promise.all([
            prisma_1.prisma.currency.findMany({ where, skip, take: pageSize, orderBy: { code: 'asc' } }),
            prisma_1.prisma.currency.count({ where }),
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
        const item = await prisma_1.prisma.currency.create({ data: payload });
        return res.status(201).json(item);
    }
    catch (error) {
        return next(error);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const payload = schema.partial().parse(req.body);
        const item = await prisma_1.prisma.currency.update({ where: { id: req.params.id }, data: payload });
        return res.json(item);
    }
    catch (error) {
        return next(error);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        await prisma_1.prisma.currency.delete({ where: { id: req.params.id } });
        return res.status(204).send();
    }
    catch (error) {
        return next(error);
    }
});
exports.default = router;
