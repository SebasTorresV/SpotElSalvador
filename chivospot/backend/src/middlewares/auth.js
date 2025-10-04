import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export function authenticate(optional = false) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    let token = null;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    if (!token && req.cookies[config.sessionCookieName]) {
      token = req.cookies[config.sessionCookieName];
    }
    if (!token) {
      if (optional) return next();
      return res.status(401).json({ message: 'Autenticación requerida' });
    }
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      req.user = payload;
      next();
    } catch (error) {
      if (optional) return next();
      return res.status(401).json({ message: 'Token inválido' });
    }
  };
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }
    if (!roles.length || roles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ message: 'No autorizado' });
  };
}
