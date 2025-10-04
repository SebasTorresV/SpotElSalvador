import { validate, schemas } from '../utils/validator.js';
import { listEvents, findEvent } from '../services/event-service.js';

export async function getEvents(req, res, next) {
  try {
    const data = validate(schemas.eventQuery, {
      ...req.query,
      category_id: Array.isArray(req.query.category_id) ? req.query.category_id : req.query.category_id ? [req.query.category_id] : [],
      free_only: req.query.free_only === 'true' || req.query.free_only === true,
    });
    const lat = req.query.lat ? Number(req.query.lat) : undefined;
    const lng = req.query.lng ? Number(req.query.lng) : undefined;
    const result = await listEvents({ ...data, lat, lng });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getEventById(req, res, next) {
  try {
    const event = await findEvent(req.params.id);
    res.json(event);
  } catch (error) {
    next(error);
  }
}

export async function getEventMetrics(req, res, next) {
  try {
    res.json({ impressions: 0, detail_views: 0, favorites: 0 });
  } catch (error) {
    next(error);
  }
}
