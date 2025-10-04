INSERT INTO departments (id, nombre) VALUES
  (1, 'Ahuachapán'),
  (2, 'Santa Ana'),
  (3, 'Sonsonate'),
  (4, 'Chalatenango'),
  (5, 'La Libertad'),
  (6, 'San Salvador'),
  (7, 'Cuscatlán'),
  (8, 'La Paz'),
  (9, 'Cabañas'),
  (10, 'San Vicente'),
  (11, 'Usulután'),
  (12, 'San Miguel'),
  (13, 'Morazán'),
  (14, 'La Unión')
ON CONFLICT (id) DO NOTHING;

INSERT INTO municipalities (department_id, nombre) VALUES
  (6, 'San Salvador'),
  (6, 'Soyapango'),
  (6, 'Mejicanos'),
  (5, 'Santa Tecla'),
  (5, 'Antiguo Cuscatlán')
ON CONFLICT DO NOTHING;
