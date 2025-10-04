# ChivoSpot

Aplicación monorepo para descubrir y gestionar eventos en El Salvador. Incluye frontend estático con HTML/CSS/JS y API Node.js + Express con PostgreSQL/PostGIS.

## Requisitos

- Node.js 20+
- Docker y Docker Compose
- PostgreSQL 15 con PostGIS (opcional si se usa Docker)

## Puesta en marcha (desarrollo)

1. Copia `.env.example` a `.env` y ajusta valores.
2. Levanta servicios:

```bash
cd ops
docker-compose up -d
```

3. Aplica migraciones y semillas:

```bash
cd ..
npm install
npm run db:migrate
npm run db:seed
```

4. Ejecuta el backend en modo desarrollo y sirve el frontend estático:

```bash
npm run dev:backend
```

El sitio quedará disponible en `http://localhost:4000`.

## Scripts útiles

- `npm run db:migrate`: ejecuta migraciones SQL.
- `npm run db:seed`: carga catálogos base y datos demo.
- `npm run lint`: ejecuta ESLint.
- `npm run format`: aplica Prettier.
- `npm run test`: corre Jest + Playwright (placeholders).
- `npm run build`: prepara artefactos (no-op actualmente).

## Estructura

```
/chivospot
  /frontend
  /backend
  /ops
  package.json
```

## Producción

- Construye la imagen del backend con `docker build -f ops/Dockerfile.backend -t chivospot-backend .`.
- Configura Nginx usando `ops/nginx.conf` como referencia.
- Establece `SESSION_COOKIE_SECURE=true` y `CORS_ORIGIN` con los dominios válidos.

## Seguridad

- JWT de acceso corto + refresh en cookie httpOnly.
- Helmet + CORS restringido + rate limiting.
- Validación de payloads con Zod.

## Base de datos

- Extensiones: PostGIS, unaccent, pg_trgm, uuid-ossp.
- Vistas materializadas para métricas diarias y panorama general.

## Métricas y observabilidad

- Endpoints `/healthz` y `/readyz` para verificación.
- Logging estructurado con Pino.
