export async function getProfile(req, res, next) {
  try {
    res.json({ nombre: 'Organización Demo', telefono: '', sitio: '', redes_json: {} });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function listVenues(req, res, next) {
  try {
    res.json([]);
  } catch (error) {
    next(error);
  }
}

export async function createVenue(req, res, next) {
  try {
    res.status(201).json({ id: 'venue-demo', ...req.body });
  } catch (error) {
    next(error);
  }
}

export async function updateVenue(req, res, next) {
  try {
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    next(error);
  }
}

export async function deleteVenue(req, res, next) {
  try {
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function listOrgEvents(req, res, next) {
  try {
    res.json({ items: [] });
  } catch (error) {
    next(error);
  }
}

export async function createEvent(req, res, next) {
  try {
    res.status(201).json({ id: 'event-demo', ...req.body });
  } catch (error) {
    next(error);
  }
}

export async function updateEvent(req, res, next) {
  try {
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    next(error);
  }
}

export async function submitEvent(req, res, next) {
  try {
    res.json({ id: req.params.id, estado: 'pendiente' });
  } catch (error) {
    next(error);
  }
}

export async function cancelEvent(req, res, next) {
  try {
    res.json({ id: req.params.id, estado: 'cancelado' });
  } catch (error) {
    next(error);
  }
}
