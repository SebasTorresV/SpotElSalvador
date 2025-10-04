import { Router } from 'express';
import { healthz, readyz } from '../controllers/system-controller.js';

export const healthRouter = Router();

healthRouter.get('/healthz', healthz);
healthRouter.get('/readyz', readyz);
