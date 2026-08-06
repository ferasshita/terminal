import { Router } from 'express';
import { z } from 'zod';

import { prisma } from '../lib/prisma';
import { getPagination } from '../utils/pagination';

const router = Router();

const schema = z.object({
  name: z.string().min(2),
  city: z.string().min(2),
  address: z.string().min(2),
  phone: z.string().min(3),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  verified: z.boolean().optional().default(false),
});

router.get('/', async (req, res, next) => {
  try {
    const { skip, page, pageSize } = getPagination(req.query as Record<string, unknown>);
    const city = req.query.city as string | undefined;

    const where = city
      ? {
          city: {
            contains: city,
            mode: 'insensitive' as const,
          },
        }
      : undefined;

    const [items, total] = await Promise.all([
      prisma.exchangeOffice.findMany({ where, skip, take: pageSize, orderBy: { city: 'asc' } }),
      prisma.exchangeOffice.count({ where }),
    ]);

    return res.json({ items, total, page, pageSize });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = schema.parse(req.body);
    const item = await prisma.exchangeOffice.create({ data: payload });
    return res.status(201).json(item);
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = schema.partial().parse(req.body);
    const item = await prisma.exchangeOffice.update({ where: { id: req.params.id }, data: payload });
    return res.json(item);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.exchangeOffice.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;
