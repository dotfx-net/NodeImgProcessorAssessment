import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import errorhandler from 'errorhandler';
import tasksRouter from './routes/tasks.routes';
import { config } from './config/config';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

export function createServer() {
  const app = express();
  const isDev = env.NODE_ENV === 'development';

  if (isDev) { app.use(morgan('dev')); }

  app.use(express.json({ limit: config.express.jsonLimit }));

  if (isDev && !!config?.cors) { app.use(cors({ origin: config.cors.origin })); }

  app.use('/tasks', tasksRouter);

  if (isDev) {
    app.use(errorhandler());
    app.use(errorHandler);
  } else {
    app.use(errorHandler);
  }

  return app;
}
