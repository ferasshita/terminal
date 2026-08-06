"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const pagination_1 = require("../utils/pagination");
const router = (0, express_1.Router)();
const schema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    city: zod_1.z.string().min(2),
    address: zod_1.z.string().min(2),
    phone: zod_1.z.string().min(3),
    latitude: zod_1.z.coerce.number(),
    longitude: zod_1.z.coerce.number(),
    verified: zod_1.z.boolean().optional().default(false),
});
router.get('/', async (req, res, next) => {
    try {
        const { skip, page, pageSize } = (0, pagination_1.getPagination)(req.query);
        const city = req.query.city;
        const where = city
            ? {
                city: {
                    contains: city,
                    mode: 'insensitive',
                },
            }
            : undefined;
        const [items, total] = await Promise.all([
            prisma_1.prisma.exchangeOffice.findMany({ where, skip, take: pageSize, orderBy: { city: 'asc' } }),
            prisma_1.prisma.exchangeOffice.count({ where }),
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
        const item = await prisma_1.prisma.exchangeOffice.create({ data: payload });
        return res.status(201).json(item);
    }
    catch (error) {
        return next(error);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const payload = schema.partial().parse(req.body);
        const item = await prisma_1.prisma.exchangeOffice.update({ where: { id: req.params.id }, data: payload });
        return res.json(item);
    }
    catch (error) {
        return next(error);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        await prisma_1.prisma.exchangeOffice.delete({ where: { id: req.params.id } });
        return res.status(204).send();
    }
    catch (error) {
        return next(error);
    }
});
exports.default = router;
