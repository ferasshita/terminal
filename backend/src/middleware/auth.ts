import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

import { env } from '../config/env';
import { HttpError } from '../utils/http';

interface TokenPayload {
  sub: string;
  role: Role;
}

export const auth = (req: Request, _res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization;

  if (!bearer?.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Authentication required'));
  }

  const token = bearer.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new HttpError(401, 'Invalid token'));
  }
};

export const authorize = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new HttpError(401, 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, 'Access denied'));
    }

    next();
  };
};
