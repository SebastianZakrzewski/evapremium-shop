import { Pool } from 'pg';
import { env } from '@/config/env';

const pool = new Pool({
  host: env.postgresql.host,
  port: env.postgresql.port,
  user: env.postgresql.user,
  password: env.postgresql.password,
  database: env.postgresql.database,
  ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});

// Test connection
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool; 

