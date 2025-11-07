import express, { type Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import errorhandler from 'errorhandler';
import swaggerUi from 'swagger-ui-express';
import { config } from '@/core/infrastructure/config/config';
import { env } from '@/core/infrastructure/config/env';
import { swaggerSpec } from '@/core/infrastructure/config/swagger';
import { DIContainer } from '@/core/infrastructure/config/di-container';
import { errorHandler } from '@/core/infrastructure/adapters/in/http/middleware/errorHandler';
import { createTaskRoutes } from '@/core/infrastructure/adapters/in/http/routes/tasks.routes';

export function createServer(container: DIContainer): Express {
  const app = express();
  const isDev = env.NODE_ENV === 'development';

  if (isDev) { app.use(morgan('dev')); }

  app.use(express.json({ limit: config.express.jsonLimit }));

  if (isDev && !!config?.cors) { app.use(cors({ origin: config.cors.origin })); }

  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'Image Processing API'
  }));

  app.use('/tasks', createTaskRoutes(container));

  if (isDev) {
    app.use(errorhandler());
    app.use(errorHandler);
  } else {
    app.use(errorHandler);
  }

  return app;
}
