CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  hash TEXT NOT NULL,
  nombre TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'visitante',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID REFERENCES users(id),
  nombre TEXT NOT NULL,
  logo_url TEXT,
  telefono TEXT,
  sitio TEXT,
  redes_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_members (
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, organization_id)
);

CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  nombre TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS municipalities (
  id SERIAL PRIMARY KEY,
  department_id INT REFERENCES departments(id),
  nombre TEXT NOT NULL,
  UNIQUE(department_id, nombre)
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  nombre TEXT NOT NULL,
  direccion TEXT,
  geom GEOGRAPHY(Point, 4326),
  aforo INT,
  servicios_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  venue_id UUID REFERENCES venues(id),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  category_id INT REFERENCES categories(id),
  department_id INT REFERENCES departments(id),
  municipality_id INT REFERENCES municipalities(id),
  direccion TEXT,
  geom GEOGRAPHY(Point, 4326),
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ,
  precio NUMERIC(10,2) NOT NULL DEFAULT 0,
  imagen_url TEXT,
  estado_publicacion TEXT NOT NULL DEFAULT 'borrador',
  etiquetas TEXT[],
  destacado BOOLEAN DEFAULT FALSE,
  destacado_desde TIMESTAMPTZ,
  destacado_hasta TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID REFERENCES users(id),
  event_id UUID REFERENCES events(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, event_id)
);

CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  event_id UUID REFERENCES events(id),
  at TIMESTAMPTZ NOT NULL,
  nota TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS moderation_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID REFERENCES users(id),
  event_id UUID REFERENCES events(id),
  action TEXT NOT NULL,
  comentario TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  diff_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  t TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_session_id UUID,
  user_id UUID REFERENCES users(id),
  event_id UUID REFERENCES events(id),
  type TEXT,
  source TEXT,
  depto_id INT,
  muni_id INT,
  ip_hash TEXT,
  ua_hash TEXT
);

CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id),
  url TEXT NOT NULL,
  alt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_fecha_inicio ON events(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_events_categoria ON events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_estado ON events(estado_publicacion);
CREATE INDEX IF NOT EXISTS idx_events_geom ON events USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_venues_geom ON venues USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_events_tsvector ON events USING GIN (to_tsvector('spanish', titulo || ' ' || coalesce(descripcion,'')));
CREATE INDEX IF NOT EXISTS idx_events_unaccent ON events USING GIN (unaccent(titulo) gin_trgm_ops);
