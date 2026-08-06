import { Router } from 'express';
import { Importance } from '@prisma/client';
import { z } from 'zod';

import { prisma } from '../lib/prisma';
import { getPagination } from '../utils/pagination';

const router = Router();

const schema = z.object({
  title: z.string().min(2),
  country: z.string().min(2),
  currencyCode: z.string().min(3).max(3).transform((v) => v.toUpperCase()),
  forecast: z.string().min(1),
  previous: z.string().min(1),
  actual: z.string().optional(),
  importance: z.nativeEnum(Importance),
  eventDate: z.coerce.date(),
});

router.get('/', async (req, res, next) => {
  try {
    const { skip, page, pageSize } = getPagination(req.query as Record<string, unknown>);
    const currencyCode = (req.query.currencyCode as string | undefined)?.toUpperCase();
    const country = req.query.country as string | undefined;

    const where = {
      ...(currencyCode ? { currencyCode } : {}),
      ...(country ? { country: { contains: country, mode: 'insensitive' as const } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.economicEvent.findMany({ where, skip, take: pageSize, orderBy: { eventDate: 'asc' }, include: { currency: true } }),
      prisma.economicEvent.count({ where }),
    ]);

    return res.json({ items, total, page, pageSize });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = schema.parse(req.body);
    const item = await prisma.economicEvent.create({ data: payload, include: { currency: true } });
    return res.status(201).json(item);
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = schema.partial().parse(req.body);
    const item = await prisma.economicEvent.update({ where: { id: req.params.id }, data: payload, include: { currency: true } });
    return res.json(item);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.economicEvent.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;
