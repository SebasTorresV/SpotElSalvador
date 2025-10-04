WITH admin_user AS (
  INSERT INTO users (email, hash, nombre, role)
  VALUES ('admin@chivospot.sv', '$2a$12$1rhlKzA1NVuMcZV8K4D4ZO0w.zAV/QXpVZl8vGeOawxDFUY8ailqS', 'Admin Demo', 'admin')
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id
), organizer_user AS (
  INSERT INTO users (email, hash, nombre, role)
  VALUES ('organizador@chivospot.sv', '$2a$12$1rhlKzA1NVuMcZV8K4D4ZO0w.zAV/QXpVZl8vGeOawxDFUY8ailqS', 'Organizador Demo', 'organizador')
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id
), org AS (
  INSERT INTO organizations (owner_user_id, nombre, sitio)
  SELECT id, 'Organización Demo', 'https://chivospot.sv'
  FROM organizer_user
  ON CONFLICT (owner_user_id) DO UPDATE SET nombre = EXCLUDED.nombre
  RETURNING id
)
INSERT INTO organization_members (user_id, organization_id, role)
SELECT ou.id, o.id, 'owner'
FROM organizer_user ou, org o
ON CONFLICT DO NOTHING;

WITH org AS (SELECT id FROM organizations LIMIT 1)
INSERT INTO events (
  organization_id,
  titulo,
  descripcion,
  category_id,
  department_id,
  municipality_id,
  direccion,
  geom,
  fecha_inicio,
  fecha_fin,
  precio,
  imagen_url,
  estado_publicacion
) VALUES
  (
    (SELECT id FROM org),
    'Feria Gastronómica Centro Histórico',
    'Sabores tradicionales y música en vivo en el corazón de San Salvador.',
    3,
    6,
    (SELECT id FROM municipalities WHERE nombre = 'San Salvador' LIMIT 1),
    'Plaza Libertad, San Salvador',
    ST_SetSRID(ST_MakePoint(-89.1908, 13.6975), 4326),
    NOW() + INTERVAL '1 day',
    NOW() + INTERVAL '1 day' + INTERVAL '3 hours',
    0,
    'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80',
    'aprobado'
  ),
  (
    (SELECT id FROM org),
    'Concierto en el Parque Daniel Hernández',
    'Bandas locales en vivo en Santa Tecla.',
    1,
    5,
    (SELECT id FROM municipalities WHERE nombre = 'Santa Tecla' LIMIT 1),
    'Parque Daniel Hernández, Santa Tecla',
    ST_SetSRID(ST_MakePoint(-89.2824, 13.6761), 4326),
    NOW() + INTERVAL '5 day',
    NOW() + INTERVAL '5 day' + INTERVAL '2 hours',
    10,
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=600&q=80',
    'aprobado'
  )
ON CONFLICT DO NOTHING;
