import { query } from '../config/database.js';

const BASE_EVENT_FIELDS = `
  events.id,
  events.titulo,
  events.descripcion,
  events.category_id,
  events.department_id,
  events.municipality_id,
  events.fecha_inicio,
  events.fecha_fin,
  events.precio,
  events.estado_publicacion,
  events.imagen_url,
  events.geom,
  events.created_at,
  events.updated_at,
  events.etiquetas,
  events.destacado,
  events.destacado_desde,
  events.destacado_hasta,
  organizations.nombre AS organizacion_nombre,
  departments.nombre AS departamento_nombre,
  municipalities.nombre AS municipio_nombre,
  categories.nombre AS categoria_nombre
`;

export async function searchEvents(filters) {
  const conditions = ['events.estado_publicacion = \"aprobado\"'];
  const params = [];
  let idx = 1;

  if (filters.q) {
    params.push(`%${filters.q}%`);
    conditions.push(`unaccent(events.titulo) ILIKE unaccent($${idx++})`);
  }
  if (filters.department_id) {
    params.push(filters.department_id);
    conditions.push(`events.department_id = $${idx++}`);
  }
  if (filters.municipality_id) {
    params.push(filters.municipality_id);
    conditions.push(`events.municipality_id = $${idx++}`);
  }
  if (filters.category_id?.length) {
    const placeholders = filters.category_id.map((id) => `$${idx++}`);
    params.push(...filters.category_id);
    conditions.push(`events.category_id IN (${placeholders.join(',')})`);
  }
  if (filters.price_max) {
    params.push(Number(filters.price_max));
    conditions.push(`events.precio <= $${idx++}`);
  }
  if (filters.free_only) {
    conditions.push('events.precio = 0');
  }
  if (filters.date_from) {
    params.push(filters.date_from);
    conditions.push(`events.fecha_inicio >= $${idx++}`);
  }
  if (filters.date_to) {
    params.push(filters.date_to);
    conditions.push(`events.fecha_inicio <= $${idx++}`);
  }
  if (filters.bbox) {
    const [minLng, minLat, maxLng, maxLat] = filters.bbox.split(',').map(Number);
    conditions.push(`events.geom && ST_MakeEnvelope($${idx}, $${idx + 1}, $${idx + 2}, $${idx + 3}, 4326)`);
    params.push(minLng, minLat, maxLng, maxLat);
    idx += 4;
  }

  const order = (() => {
    switch (filters.order) {
      case 'distance':
        if (filters.lat && filters.lng) {
          conditions.push('events.geom IS NOT NULL');
          params.push(filters.lng, filters.lat);
          const distanceExpr = `ST_Distance(events.geom, ST_SetSRID(ST_MakePoint($${idx}, $${idx + 1}), 4326))`;
          idx += 2;
          return `${distanceExpr} ASC`;
        }
        return 'events.fecha_inicio ASC';
      case 'popularity':
        return 'events.destacado DESC, events.fecha_inicio ASC';
      default:
        return 'events.fecha_inicio ASC';
    }
  })();

  const limit = Number(filters.limit) || 20;
  const offset = Number(filters.offset) || 0;

  const sql = `
    SELECT ${BASE_EVENT_FIELDS}
    FROM events
    LEFT JOIN organizations ON organizations.id = events.organization_id
    LEFT JOIN departments ON departments.id = events.department_id
    LEFT JOIN municipalities ON municipalities.id = events.municipality_id
    LEFT JOIN categories ON categories.id = events.category_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY ${order}
    LIMIT ${limit} OFFSET ${offset}
  `;

  const { rows } = await query(sql, params);
  return rows;
}

export async function countEvents(filters) {
  const conditions = ['events.estado_publicacion = \"aprobado\"'];
  const params = [];
  let idx = 1;

  if (filters.department_id) {
    params.push(filters.department_id);
    conditions.push(`events.department_id = $${idx++}`);
  }

  const sql = `SELECT COUNT(*)::int FROM events WHERE ${conditions.join(' AND ')}`;
  const { rows } = await query(sql, params);
  return rows[0]?.count || 0;
}

export async function getEventById(id) {
  const sql = `
    SELECT ${BASE_EVENT_FIELDS}
    FROM events
    LEFT JOIN organizations ON organizations.id = events.organization_id
    LEFT JOIN departments ON departments.id = events.department_id
    LEFT JOIN municipalities ON municipalities.id = events.municipality_id
    LEFT JOIN categories ON categories.id = events.category_id
    WHERE events.id = $1
  `;
  const { rows } = await query(sql, [id]);
  return rows[0];
}
