import express, { type Express } from 'express';

export function scaffoldApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  return app;
}
