import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env';
import { auth, authorize } from './middleware/auth';
import { errorHandler } from './middleware/error';
import authRoutes from './routes/auth';
import currenciesRoutes from './routes/currencies';
import economicEventsRoutes from './routes/economic-events';
import exchangeOfficesRoutes from './routes/exchange-offices';
import exchangeRatesRoutes from './routes/exchange-rates';
import historicalRatesRoutes from './routes/historical-rates';
import newsRoutes from './routes/news';
import searchRoutes from './routes/search';
import sourcesRoutes from './routes/sources';
import usersRoutes from './routes/users';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);

const adminWriteGuard = [auth, (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.method === 'GET') {
    return next();
  }

  return authorize('ADMIN')(req, res, next);
}];

app.use('/currencies', ...adminWriteGuard, currenciesRoutes);
app.use('/sources', ...adminWriteGuard, sourcesRoutes);
app.use('/exchange-rates', ...adminWriteGuard, exchangeRatesRoutes);
app.use('/historical-rates', auth, historicalRatesRoutes);
app.use('/news', ...adminWriteGuard, newsRoutes);
app.use('/economic-events', ...adminWriteGuard, economicEventsRoutes);
app.use('/exchange-offices', ...adminWriteGuard, exchangeOfficesRoutes);
app.use('/search', auth, searchRoutes);
app.use('/users', auth, authorize('ADMIN'), usersRoutes);

app.use(errorHandler);

export default app;
