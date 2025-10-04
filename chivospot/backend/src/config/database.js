import pg from 'pg';
import { config } from './env.js';

pg.types.setTypeParser(pg.types.builtins.TIMESTAMPTZ, (val) => (val ? new Date(val) : null));

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});

export async function query(sql, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result;
  } finally {
    client.release();
  }
}
