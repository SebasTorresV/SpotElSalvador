import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  getProfile,
  updateProfile,
  listVenues,
  createVenue,
  updateVenue,
  deleteVenue,
  listOrgEvents,
  createEvent,
  updateEvent,
  submitEvent,
  cancelEvent,
} from '../controllers/organizer-controller.js';

export const organizerRouter = Router();

organizerRouter.use(authenticate());
organizerRouter.use(authorize('organizador', 'editor', 'owner'));

organizerRouter.get('/profile', getProfile);
organizerRouter.put('/profile', updateProfile);
organizerRouter.get('/venues', listVenues);
organizerRouter.post('/venues', createVenue);
organizerRouter.put('/venues/:id', updateVenue);
organizerRouter.delete('/venues/:id', deleteVenue);
organizerRouter.get('/events', listOrgEvents);
organizerRouter.post('/events', createEvent);
organizerRouter.put('/events/:id', updateEvent);
organizerRouter.post('/events/:id/submit', submitEvent);
organizerRouter.post('/events/:id/cancel', cancelEvent);
organizerRouter.post('/events/import', (req, res) => res.json({ items: [] }));
