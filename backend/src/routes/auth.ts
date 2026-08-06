import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { z } from 'zod';

import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { auth } from '../middleware/auth';
import { HttpError } from '../utils/http';

const router = Router();

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional().default(false),
});

const signToken = (userId: string, role: Role, rememberMe: boolean) =>
  jwt.sign({ role }, env.JWT_SECRET, {
    subject: userId,
    expiresIn: rememberMe ? env.JWT_REMEMBER_EXPIRES_IN : env.JWT_EXPIRES_IN,
  });

router.post('/register', async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) {
      throw new HttpError(409, 'Email already in use');
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    const user = await prisma.user.create({
      data: {
        fullName: payload.fullName,
        email: payload.email,
        passwordHash,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: payload.email } });
    if (!user || !user.isActive) {
      throw new HttpError(401, 'Invalid credentials');
    }

    const valid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!valid) {
      throw new HttpError(401, 'Invalid credentials');
    }

    const token = signToken(user.id, user.role, payload.rememberMe);

    return res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/profile', auth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    return res.json(user);
  } catch (error) {
    return next(error);
  }
});

export default router;
