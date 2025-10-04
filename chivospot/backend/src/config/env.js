import dotenv from 'dotenv';

dotenv.config();

const required = ['DATABASE_URL', 'JWT_SECRET'];
required.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`Variable de entorno faltante: ${key}`);
  }
});

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  baseUrl: process.env.APP_BASE_URL || 'http://localhost:4000',
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/chivospot',
  jwtSecret: process.env.JWT_SECRET || 'insecure-development-secret',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:4000').split(','),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 120),
  sessionCookieName: process.env.SESSION_COOKIE_NAME || 'chsp_sid',
  sessionCookieSecure: process.env.SESSION_COOKIE_SECURE === 'true',
  sessionCookieSameSite: process.env.SESSION_COOKIE_SAMESITE || 'Strict',
  timezone: process.env.TZ || 'America/El_Salvador',
};
