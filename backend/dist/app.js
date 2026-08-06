"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const auth_1 = require("./middleware/auth");
const error_1 = require("./middleware/error");
const auth_2 = __importDefault(require("./routes/auth"));
const currencies_1 = __importDefault(require("./routes/currencies"));
const economic_events_1 = __importDefault(require("./routes/economic-events"));
const exchange_offices_1 = __importDefault(require("./routes/exchange-offices"));
const exchange_rates_1 = __importDefault(require("./routes/exchange-rates"));
const historical_rates_1 = __importDefault(require("./routes/historical-rates"));
const news_1 = __importDefault(require("./routes/news"));
const search_1 = __importDefault(require("./routes/search"));
const sources_1 = __importDefault(require("./routes/sources"));
const users_1 = __importDefault(require("./routes/users"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: env_1.env.CORS_ORIGIN }));
app.use(express_1.default.json({ limit: '1mb' }));
app.use((0, morgan_1.default)('dev'));
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.use('/auth', auth_2.default);
const adminWriteGuard = [auth_1.auth, (req, res, next) => {
        if (req.method === 'GET') {
            return next();
        }
        return (0, auth_1.authorize)('ADMIN')(req, res, next);
    }];
app.use('/currencies', ...adminWriteGuard, currencies_1.default);
app.use('/sources', ...adminWriteGuard, sources_1.default);
app.use('/exchange-rates', ...adminWriteGuard, exchange_rates_1.default);
app.use('/historical-rates', auth_1.auth, historical_rates_1.default);
app.use('/news', ...adminWriteGuard, news_1.default);
app.use('/economic-events', ...adminWriteGuard, economic_events_1.default);
app.use('/exchange-offices', ...adminWriteGuard, exchange_offices_1.default);
app.use('/search', auth_1.auth, search_1.default);
app.use('/users', auth_1.auth, (0, auth_1.authorize)('ADMIN'), users_1.default);
app.use(error_1.errorHandler);
exports.default = app;
