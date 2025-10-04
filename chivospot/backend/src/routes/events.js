import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { getEvents, getEventById, getEventMetrics } from '../controllers/events-controller.js';

export const eventsRouter = Router();

eventsRouter.get('/events', getEvents);
eventsRouter.get('/events/:id', getEventById);
eventsRouter.get('/events/:id/metrics/summary', getEventMetrics);
eventsRouter.post('/events/:id/favorite', authenticate(), (req, res) => res.status(201).json({ favorite: true }));
eventsRouter.delete('/events/:id/favorite', authenticate(), (req, res) => res.status(204).send());
eventsRouter.post('/events/:id/reminders', authenticate(), (req, res) => res.status(201).json({ reminder: true }));
eventsRouter.delete('/events/:id/reminders/:reminderId', authenticate(), (req, res) => res.status(204).send());
