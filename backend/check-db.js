import { config } from 'dotenv';
config();
import { Pool } from 'pg';

async function test() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  const reports = await pool.query('SELECT id, title, territory_id, created_by, latitude, longitude FROM reports LIMIT 5;');
  console.log('REPORTS:', reports.rows);
  
  const users = await pool.query('SELECT id, role_id, territory_id, email FROM auth LIMIT 5;');
  console.log('USERS:', users.rows);

  const roles = await pool.query('SELECT id, code FROM roles;');
  console.log('ROLES:', roles.rows);
  
  process.exit(0);
}
test();
