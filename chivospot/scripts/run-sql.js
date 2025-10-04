import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), 'ops/.env.example') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const target = process.argv[2];

if (!target) {
  console.error('Uso: node scripts/run-sql.js <migrations|seeds>');
  process.exit(1);
}

const dir = path.resolve(__dirname, `../backend/db/${target}`);
const files = fs
  .readdirSync(dir)
  .filter((file) => file.endsWith('.sql'))
  .sort();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(dir, file), 'utf8');
      console.log(`Ejecutando ${file}`);
      await client.query(sql);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
