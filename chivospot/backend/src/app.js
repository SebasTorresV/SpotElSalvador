import http from 'http';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { v4 as uuid } from 'uuid';
import { config } from './config/env.js';
import { applyRoutes } from './routes/index.js';
import { logger } from './utils/logger.js';
import { requestContext } from './middlewares/request-context.js';

const app = express();

app.set('trust proxy', 1);

app.use((req, res, next) => {
  req.id = uuid();
  res.setHeader('X-Request-Id', req.id);
  next();
});

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", 'data:', 'https://*.tile.openstreetmap.org', 'https://placehold.co'],
      "script-src": ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
      "style-src": ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
      "connect-src": ["'self'", config.corsOrigin],
    },
  },
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || config.corsOrigin.includes(origin)) {
      callback(null, origin || true);
    } else {
      callback(new Error('Origen no permitido'));
    }
  },
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.jwtSecret));
app.use(morgan('combined'));
app.use(requestContext);

applyRoutes(app);

app.use((err, req, res, next) => {
  logger.error({ err, requestId: req.id }, 'Error no controlado');
  res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor' });
});

const server = http.createServer(app);
server.listen(config.port, () => {
  logger.info({ port: config.port }, 'Servidor iniciado');
});

export default app;
