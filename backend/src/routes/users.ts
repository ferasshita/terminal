import { Router } from 'express';
import { Role } from '@prisma/client';
import { z } from 'zod';

import { prisma } from '../lib/prisma';
import { getPagination } from '../utils/pagination';

const router = Router();

const roleSchema = z.object({
  role: z.nativeEnum(Role),
});

const statusSchema = z.object({
  isActive: z.boolean(),
});

router.get('/', async (req, res, next) => {
  try {
    const { skip, page, pageSize } = getPagination(req.query as Record<string, unknown>);

    const [items, total] = await Promise.all([
      prisma.user.findMany({
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
      prisma.user.count(),
    ]);

    return res.json({ items, total, page, pageSize });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id/role', async (req, res, next) => {
  try {
    const { role } = roleSchema.parse(req.body);
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, role: true },
    });
    return res.json(updated);
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { isActive } = statusSchema.parse(req.body);
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive },
      select: { id: true, isActive: true },
    });
    return res.json(updated);
  } catch (error) {
    return next(error);
  }
});

export default router;
