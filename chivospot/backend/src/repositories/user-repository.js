import { query } from '../config/database.js';

export async function findUserByEmail(email) {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

export async function createUser({ email, passwordHash, nombre, role = 'visitante' }) {
  const { rows } = await query(
    `INSERT INTO users (email, hash, nombre, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, nombre, role, created_at`,
    [email, passwordHash, nombre, role],
  );
  return rows[0];
}

export async function findUserById(id) {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}
