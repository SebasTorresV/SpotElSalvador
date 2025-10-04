import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  collectAnalytics,
  organizerSummary,
  organizerTimeseries,
  organizerDistribution,
  organizerExport,
} from '../controllers/analytics-controller.js';

export const analyticsRouter = Router();

analyticsRouter.post('/', collectAnalytics);
analyticsRouter.get('/organizer/summary', authenticate(), authorize('organizador', 'editor', 'owner'), organizerSummary);
analyticsRouter.get('/organizer/timeseries', authenticate(), authorize('organizador', 'editor', 'owner'), organizerTimeseries);
analyticsRouter.get('/organizer/distribution', authenticate(), authorize('organizador', 'editor', 'owner'), organizerDistribution);
analyticsRouter.get('/organizer/export.csv', authenticate(), authorize('organizador', 'editor', 'owner'), organizerExport);
