"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const env_1 = require("../config/env");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const http_1 = require("../utils/http");
const router = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
    rememberMe: zod_1.z.boolean().optional().default(false),
});
const signToken = (userId, role, rememberMe) => jsonwebtoken_1.default.sign({ role }, env_1.env.JWT_SECRET, {
    subject: userId,
    expiresIn: (rememberMe ? env_1.env.JWT_REMEMBER_EXPIRES_IN : env_1.env.JWT_EXPIRES_IN),
});
router.post('/register', async (req, res, next) => {
    try {
        const payload = registerSchema.parse(req.body);
        const existing = await prisma_1.prisma.user.findUnique({ where: { email: payload.email } });
        if (existing) {
            throw new http_1.HttpError(409, 'Email already in use');
        }
        const passwordHash = await bcryptjs_1.default.hash(payload.password, 10);
        const user = await prisma_1.prisma.user.create({
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
    }
    catch (error) {
        return next(error);
    }
});
router.post('/login', async (req, res, next) => {
    try {
        const payload = loginSchema.parse(req.body);
        const user = await prisma_1.prisma.user.findUnique({ where: { email: payload.email } });
        if (!user || !user.isActive) {
            throw new http_1.HttpError(401, 'Invalid credentials');
        }
        const valid = await bcryptjs_1.default.compare(payload.password, user.passwordHash);
        if (!valid) {
            throw new http_1.HttpError(401, 'Invalid credentials');
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
    }
    catch (error) {
        return next(error);
    }
});
router.get('/profile', auth_1.auth, async (req, res, next) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.id },
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
            throw new http_1.HttpError(404, 'User not found');
        }
        return res.json(user);
    }
    catch (error) {
        return next(error);
    }
});
exports.default = router;
