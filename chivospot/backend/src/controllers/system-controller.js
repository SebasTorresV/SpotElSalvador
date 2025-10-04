import { pool } from '../config/database.js';

export async function healthz(req, res) {
  const { rows } = await pool.query('SELECT NOW() AS now');
  res.json({ status: 'ok', time: rows[0].now });
}

export async function readyz(req, res) {
  res.json({ status: 'ready' });
}
