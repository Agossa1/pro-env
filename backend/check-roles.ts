import { Pool } from 'pg';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
  });

  const redis = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  try {
    await redis.connect();
    
    // Clear all auth:role:* keys
    const keys = await redis.keys('auth:role:*');
    if (keys.length > 0) {
      await redis.del(keys);
      console.log(`Deleted Redis keys: ${keys.join(', ')}`);
    } else {
      console.log('No Redis keys found for auth:role:*');
    }

    const res = await pool.query('SELECT code FROM roles;');
    console.log('Roles in DB: ', res.rows.map(r => r.code));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
    await redis.disconnect();
  }
}

run();
