"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
router.get('/', async (req, res, next) => {
    try {
        const q = String(req.query.q ?? '').trim();
        if (!q) {
            return res.json({ currencies: [], news: [], exchangeOffices: [], economicEvents: [] });
        }
        const [currencies, news, exchangeOffices, economicEvents] = await Promise.all([
            prisma_1.prisma.currency.findMany({
                where: {
                    OR: [
                        { code: { contains: q, mode: 'insensitive' } },
                        { name: { contains: q, mode: 'insensitive' } },
                    ],
                },
                take: 10,
            }),
            prisma_1.prisma.news.findMany({
                where: {
                    OR: [
                        { title: { contains: q, mode: 'insensitive' } },
                        { content: { contains: q, mode: 'insensitive' } },
                    ],
                },
                orderBy: { publishedAt: 'desc' },
                take: 10,
            }),
            prisma_1.prisma.exchangeOffice.findMany({
                where: {
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { city: { contains: q, mode: 'insensitive' } },
                    ],
                },
                take: 10,
            }),
            prisma_1.prisma.economicEvent.findMany({
                where: {
                    OR: [
                        { title: { contains: q, mode: 'insensitive' } },
                        { country: { contains: q, mode: 'insensitive' } },
                    ],
                },
                orderBy: { eventDate: 'asc' },
                take: 10,
            }),
        ]);
        return res.json({ currencies, news, exchangeOffices, economicEvents });
    }
    catch (error) {
        return next(error);
    }
});
exports.default = router;
