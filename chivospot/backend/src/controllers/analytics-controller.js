export async function collectAnalytics(req, res, next) {
  try {
    res.status(202).json({ accepted: true });
  } catch (error) {
    next(error);
  }
}

export async function organizerSummary(req, res, next) {
  try {
    res.json({ impresiones: 0, vistas_detalle: 0, favoritos: 0, recordatorios: 0 });
  } catch (error) {
    next(error);
  }
}

export async function organizerTimeseries(req, res, next) {
  try {
    res.json([]);
  } catch (error) {
    next(error);
  }
}

export async function organizerDistribution(req, res, next) {
  try {
    res.json({});
  } catch (error) {
    next(error);
  }
}

export async function organizerExport(req, res, next) {
  try {
    res.header('Content-Type', 'text/csv');
    res.send('fecha,impresiones,vistas_detalle\n');
  } catch (error) {
    next(error);
  }
}
