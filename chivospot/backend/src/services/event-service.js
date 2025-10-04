import { searchEvents, countEvents, getEventById } from '../repositories/event-repository.js';

export async function listEvents(filters = {}) {
  const items = await searchEvents(filters);
  const total = await countEvents(filters);
  return {
    items,
    total,
    hasMore: (Number(filters.offset) || 0) + items.length < total,
  };
}

export async function findEvent(id) {
  const event = await getEventById(id);
  if (!event) {
    const err = new Error('Evento no encontrado');
    err.status = 404;
    throw err;
  }
  return event;
}
