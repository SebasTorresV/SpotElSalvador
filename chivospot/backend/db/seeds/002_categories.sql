INSERT INTO categories (slug, nombre) VALUES
  ('musica', 'Música'),
  ('teatro', 'Teatro'),
  ('ferias', 'Ferias'),
  ('deportes', 'Deportes'),
  ('conferencias', 'Conferencias'),
  ('familia', 'Familia')
ON CONFLICT (slug) DO NOTHING;
