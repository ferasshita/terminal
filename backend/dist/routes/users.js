"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const pagination_1 = require("../utils/pagination");
const router = (0, express_1.Router)();
const roleSchema = zod_1.z.object({
    role: zod_1.z.nativeEnum(client_1.Role),
});
const statusSchema = zod_1.z.object({
    isActive: zod_1.z.boolean(),
});
router.get('/', async (req, res, next) => {
    try {
        const { skip, page, pageSize } = (0, pagination_1.getPagination)(req.query);
        const [items, total] = await Promise.all([
            prisma_1.prisma.user.findMany({
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                },
            }),
            prisma_1.prisma.user.count(),
        ]);
        return res.json({ items, total, page, pageSize });
    }
    catch (error) {
        return next(error);
    }
});
router.patch('/:id/role', async (req, res, next) => {
    try {
        const { role } = roleSchema.parse(req.body);
        const updated = await prisma_1.prisma.user.update({
            where: { id: req.params.id },
            data: { role },
            select: { id: true, role: true },
        });
        return res.json(updated);
    }
    catch (error) {
        return next(error);
    }
});
router.patch('/:id/status', async (req, res, next) => {
    try {
        const { isActive } = statusSchema.parse(req.body);
        const updated = await prisma_1.prisma.user.update({
            where: { id: req.params.id },
            data: { isActive },
            select: { id: true, isActive: true },
        });
        return res.json(updated);
    }
    catch (error) {
        return next(error);
    }
});
exports.default = router;
