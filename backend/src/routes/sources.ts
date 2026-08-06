import { Router } from 'express';
import { SourceType } from '@prisma/client';
import { z } from 'zod';

import { prisma } from '../lib/prisma';
import { getPagination } from '../utils/pagination';

const router = Router();

const schema = z.object({
  name: z.string().min(2),
  website: z.string().url(),
  type: z.nativeEnum(SourceType),
});

router.get('/', async (req, res, next) => {
  try {
    const { skip, page, pageSize } = getPagination(req.query as Record<string, unknown>);
    const [items, total] = await Promise.all([
      prisma.source.findMany({ skip, take: pageSize, orderBy: { name: 'asc' } }),
      prisma.source.count(),
    ]);

    return res.json({ items, total, page, pageSize });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = schema.parse(req.body);
    const item = await prisma.source.create({ data: payload });
    return res.status(201).json(item);
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = schema.partial().parse(req.body);
    const item = await prisma.source.update({ where: { id: req.params.id }, data: payload });
    return res.json(item);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.source.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;
