import { Router } from 'express';

import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const q = String(req.query.q ?? '').trim();

    if (!q) {
      return res.json({ currencies: [], news: [], exchangeOffices: [], economicEvents: [] });
    }

    const [currencies, news, exchangeOffices, economicEvents] = await Promise.all([
      prisma.currency.findMany({
        where: {
          OR: [
            { code: { contains: q, mode: 'insensitive' } },
            { name: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      prisma.news.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
          ],
        },
        orderBy: { publishedAt: 'desc' },
        take: 10,
      }),
      prisma.exchangeOffice.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { city: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      prisma.economicEvent.findMany({
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
  } catch (error) {
    return next(error);
  }
});

export default router;
