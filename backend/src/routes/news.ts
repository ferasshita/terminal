import { Router } from 'express';
import { Importance } from '@prisma/client';
import { z } from 'zod';

import { prisma } from '../lib/prisma';
import { getPagination } from '../utils/pagination';

const router = Router();

const schema = z.object({
  title: z.string().min(2),
  content: z.string().min(2),
  category: z.string().min(2),
  countryCode: z.string().min(2),
  currencyCode: z.string().min(3).max(3).transform((v) => v.toUpperCase()),
  importance: z.nativeEnum(Importance),
  sourceId: z.string().min(1),
  publishedAt: z.coerce.date().optional(),
});

router.get('/', async (req, res, next) => {
  try {
    const { skip, page, pageSize } = getPagination(req.query as Record<string, unknown>);
    const countryCode = req.query.countryCode as string | undefined;
    const currencyCode = (req.query.currencyCode as string | undefined)?.toUpperCase();
    const category = req.query.category as string | undefined;
    const importance = req.query.importance as Importance | undefined;

    const where = {
      ...(countryCode ? { countryCode } : {}),
      ...(currencyCode ? { currencyCode } : {}),
      ...(category ? { category: { contains: category, mode: 'insensitive' as const } } : {}),
      ...(importance ? { importance } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.news.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { publishedAt: 'desc' },
        include: { source: true, currency: true },
      }),
      prisma.news.count({ where }),
    ]);

    return res.json({ items, total, page, pageSize });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = schema.parse(req.body);
    const item = await prisma.news.create({ data: payload, include: { source: true, currency: true } });
    return res.status(201).json(item);
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = schema.partial().parse(req.body);
    const item = await prisma.news.update({
      where: { id: req.params.id },
      data: payload,
      include: { source: true, currency: true },
    });
    return res.json(item);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.news.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;
