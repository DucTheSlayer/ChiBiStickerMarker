import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import { api, ApiError } from './routes/api.js';
import { assets } from './routes/assets.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  const origin = process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()).filter(Boolean);
  app.use(cors({ origin: origin && origin.length ? origin : true }));

  app.use('/api', api);
  app.use('/assets', assets);

  app.use('/api', (_req, _res, next) => next(new ApiError(404, 'NOT_FOUND', 'Route not found')));

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof ApiError) {
      res.status(err.status).json({ error: { code: err.code, message: err.message } });
      return;
    }
    console.error(err);
    res.status(500).json({ error: { code: 'INTERNAL', message: 'Internal server error' } });
  };
  app.use(onError);
  return app;
}
