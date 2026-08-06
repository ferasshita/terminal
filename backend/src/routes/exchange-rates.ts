import { Router } from 'express';
import { RateType } from '@prisma/client';
import { z } from 'zod';

import { prisma } from '../lib/prisma';
import { getPagination } from '../utils/pagination';

const router = Router();

const schema = z.object({
  currencyCode: z.string().min(3).max(3).transform((v) => v.toUpperCase()),
  rate: z.coerce.number().positive(),
  type: z.nativeEnum(RateType),
  sourceId: z.string().min(1),
});

router.get('/', async (req, res, next) => {
  try {
    const { skip, page, pageSize } = getPagination(req.query as Record<string, unknown>);

    const currencyCode = (req.query.currencyCode as string | undefined)?.toUpperCase();
    const sourceId = req.query.sourceId as string | undefined;
    const type = req.query.type as RateType | undefined;
    const fromDate = req.query.fromDate ? new Date(String(req.query.fromDate)) : undefined;
    const toDate = req.query.toDate ? new Date(String(req.query.toDate)) : undefined;

    const where = {
      ...(currencyCode ? { currencyCode } : {}),
      ...(sourceId ? { sourceId } : {}),
      ...(type ? { type } : {}),
      ...(fromDate || toDate
        ? {
            createdAt: {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lte: toDate } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.exchangeRate.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { source: true, currency: true },
      }),
      prisma.exchangeRate.count({ where }),
    ]);

    return res.json({ items, total, page, pageSize });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = schema.parse(req.body);
    const item = await prisma.exchangeRate.create({
      data: payload,
      include: { source: true, currency: true },
    });

    const [latestBuy, latestSell] = await Promise.all([
      prisma.exchangeRate.findFirst({
        where: { currencyCode: payload.currencyCode, sourceId: payload.sourceId, type: RateType.BUY },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.exchangeRate.findFirst({
        where: { currencyCode: payload.currencyCode, sourceId: payload.sourceId, type: RateType.SELL },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    if (latestBuy && latestSell) {
      await prisma.historicalRate.create({
        data: {
          currencyCode: payload.currencyCode,
          buyRate: latestBuy.rate,
          sellRate: latestSell.rate,
          sourceId: payload.sourceId,
        },
      });
    }

    return res.status(201).json(item);
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = schema.partial().parse(req.body);
    const item = await prisma.exchangeRate.update({
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
    await prisma.exchangeRate.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;
