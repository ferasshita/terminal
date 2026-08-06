import { Router } from 'express';
import { z } from 'zod';

import { prisma } from '../lib/prisma';
import { getPagination } from '../utils/pagination';

const router = Router();

const schema = z.object({
  code: z.string().min(3).max(3).transform((v) => v.toUpperCase()),
  name: z.string().min(2),
  symbol: z.string().min(1),
  country: z.string().min(2),
  flag: z.string().min(1),
  isActive: z.boolean().optional().default(true),
});

router.get('/', async (req, res, next) => {
  try {
    const { page, pageSize, skip } = getPagination(req.query as Record<string, unknown>);
    const query = (req.query.q as string | undefined)?.trim();

    const where = query
      ? {
          OR: [
            { code: { contains: query, mode: 'insensitive' as const } },
            { name: { contains: query, mode: 'insensitive' as const } },
            { country: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const [items, total] = await Promise.all([
      prisma.currency.findMany({ where, skip, take: pageSize, orderBy: { code: 'asc' } }),
      prisma.currency.count({ where }),
    ]);

    return res.json({ items, total, page, pageSize });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = schema.parse(req.body);
    const item = await prisma.currency.create({ data: payload });
    return res.status(201).json(item);
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = schema.partial().parse(req.body);
    const item = await prisma.currency.update({ where: { id: req.params.id }, data: payload });
    return res.json(item);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.currency.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;
