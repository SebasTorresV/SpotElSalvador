import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { authRouter } from './auth.js';
import { catalogRouter } from './catalog.js';
import { eventsRouter } from './events.js';
import { organizerRouter } from './organizer.js';
import { adminRouter } from './admin.js';
import { analyticsRouter } from './analytics.js';
import { healthRouter } from './system.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function applyRoutes(app) {
  const api = express.Router();

  api.use('/auth', authRouter);
  api.use('/', catalogRouter);
  api.use('/', eventsRouter);
  api.use('/org', organizerRouter);
  api.use('/admin', adminRouter);
  api.use('/analytics', analyticsRouter);
  api.use('/', healthRouter);

  app.use('/api', api);

  const frontendDir = path.resolve(__dirname, '../../../frontend');
  app.use(express.static(frontendDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDir, 'index.html'));
  });
}
