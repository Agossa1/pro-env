import dotenv from 'dotenv';

dotenv.config();

const databaseConfig = {
  connectionString: process.env.DATABASE_URL,
  schema: process.env.DB_SCHEMA || 'public',
};

export default databaseConfig;