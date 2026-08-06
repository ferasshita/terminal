import { Router } from 'express';

import { prisma } from '../lib/prisma';
import { getPagination } from '../utils/pagination';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { skip, page, pageSize } = getPagination(req.query as Record<string, unknown>);
    const currencyCode = (req.query.currencyCode as string | undefined)?.toUpperCase();
    const sourceId = req.query.sourceId as string | undefined;
    const fromDate = req.query.fromDate ? new Date(String(req.query.fromDate)) : undefined;
    const toDate = req.query.toDate ? new Date(String(req.query.toDate)) : undefined;

    const where = {
      ...(currencyCode ? { currencyCode } : {}),
      ...(sourceId ? { sourceId } : {}),
      ...(fromDate || toDate
        ? {
            recordedAt: {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lte: toDate } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.historicalRate.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { recordedAt: 'desc' },
        include: { source: true, currency: true },
      }),
      prisma.historicalRate.count({ where }),
    ]);

    return res.json({ items, total, page, pageSize });
  } catch (error) {
    return next(error);
  }
});

export default router;
