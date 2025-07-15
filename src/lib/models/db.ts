import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || 'eva_user',
  password: process.env.PGPASSWORD || 'eva_password',
  database: process.env.PGDATABASE || 'eva_db',
});



export default pool; 

