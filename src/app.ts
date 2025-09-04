import express from 'express';
import dotenv from 'dotenv';

import apiRoutes from './routes';
import { sequelize } from './models';
import { AppError } from './erros/AppError';

dotenv.config();

const app = express();
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/health/db', async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ db: 'up' });
  } catch (e: any) {
    res.status(500).json({ db: 'down', error: e?.message });
  }
});

// api
app.use('/api', apiRoutes);

// 404
app.use((req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND'));
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = Number(err.status) || 500;
  const code = err.code || (status === 500 ? 'INTERNAL_SERVER_ERROR' : undefined);

  const payload: Record<string, unknown> = {
    error: err.message || 'Internal Server Error',
    ...(code ? { code } : {}),
    ...(err.details ? { details: err.details } : {}),
  };

  // em dev, incluir stack ajuda
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    payload.stack = err.stack;
  }

  res.status(status).type('application/json').send(payload);
});

export default app;