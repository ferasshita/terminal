"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().min(1),
    PORT: zod_1.z.string().default('4000'),
    JWT_SECRET: zod_1.z.string().min(8),
    JWT_EXPIRES_IN: zod_1.z.string().default('1d'),
    JWT_REMEMBER_EXPIRES_IN: zod_1.z.string().default('30d'),
    CORS_ORIGIN: zod_1.z.string().default('http://localhost:5173'),
});
exports.env = envSchema.parse(process.env);
