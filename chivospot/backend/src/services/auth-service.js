import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { findUserByEmail, createUser } from '../repositories/user-repository.js';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '30d';

function signToken(user, expiresIn) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, { expiresIn });
}

export async function registerUser({ email, password, nombre }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    const err = new Error('El email ya está registrado');
    err.status = 409;
    throw err;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createUser({ email, passwordHash, nombre, role: 'organizador' });
  return user;
}

export async function loginUser({ email, password }) {
  const user = await findUserByEmail(email);
  if (!user) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }
  const match = await bcrypt.compare(password, user.hash);
  if (!match) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }
  const accessToken = signToken(user, ACCESS_TOKEN_TTL);
  const refreshToken = signToken(user, REFRESH_TOKEN_TTL);
  return { user, accessToken, refreshToken };
}

export function createAccessToken(user) {
  return signToken(user, ACCESS_TOKEN_TTL);
}
