import { config } from '../config/env.js';
import { validate, schemas } from '../utils/validator.js';
import { registerUser, loginUser, createAccessToken } from '../services/auth-service.js';
import { findUserById } from '../repositories/user-repository.js';

export async function register(req, res, next) {
  try {
    const data = validate(schemas.register, req.body);
    const user = await registerUser(data);
    res.status(201).json({ id: user.id, email: user.email, nombre: user.nombre, role: user.role });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const data = validate(schemas.login, req.body);
    const { user, accessToken, refreshToken } = await loginUser(data);
    res.cookie(config.sessionCookieName, refreshToken, {
      httpOnly: true,
      secure: config.sessionCookieSecure,
      sameSite: config.sessionCookieSameSite,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Token inválido' });
    }
    const accessToken = createAccessToken(req.user);
    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    res.clearCookie(config.sessionCookieName);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ message: 'No autenticado' });
    const user = await findUserById(req.user.id);
    res.json({ id: user.id, email: user.email, nombre: user.nombre, role: user.role });
  } catch (error) {
    next(error);
  }
}
