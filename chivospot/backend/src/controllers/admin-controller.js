export async function listAdminEvents(req, res, next) {
  try {
    res.json({ items: [] });
  } catch (error) {
    next(error);
  }
}

export async function approveEvent(req, res, next) {
  try {
    res.json({ id: req.params.id, action: 'approved' });
  } catch (error) {
    next(error);
  }
}

export async function rejectEvent(req, res, next) {
  try {
    res.json({ id: req.params.id, action: 'rejected', comentario: req.body.comentario });
  } catch (error) {
    next(error);
  }
}

export async function archiveEvent(req, res, next) {
  try {
    res.json({ id: req.params.id, action: 'archived' });
  } catch (error) {
    next(error);
  }
}

export async function featureEvent(req, res, next) {
  try {
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    next(error);
  }
}

export async function listAuditLog(req, res, next) {
  try {
    res.json([]);
  } catch (error) {
    next(error);
  }
}

export async function adminOverview(req, res, next) {
  try {
    res.json({ eventos_creados: 0, pendientes: 0, aprobados: 0, tiempo_medio_aprobacion: 'N/D' });
  } catch (error) {
    next(error);
  }
}
