import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  listAdminEvents,
  approveEvent,
  rejectEvent,
  archiveEvent,
  featureEvent,
  listAuditLog,
  adminOverview,
} from '../controllers/admin-controller.js';

export const adminRouter = Router();

adminRouter.use(authenticate());
adminRouter.use(authorize('admin', 'revisor'));

adminRouter.get('/events', listAdminEvents);
adminRouter.post('/events/:id/approve', approveEvent);
adminRouter.post('/events/:id/reject', rejectEvent);
adminRouter.post('/events/:id/archive', archiveEvent);
adminRouter.post('/events/:id/feature', featureEvent);
adminRouter.get('/audit', listAuditLog);
adminRouter.get('/kpi/admin/overview', adminOverview);
