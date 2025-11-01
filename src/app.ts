import express from 'express';

export function createServer() {
  const app = express();

  app.use(express.json());
  app.get('/', (req, res) => res.send('Ready'));

  return app;
}
