import dotenv from 'dotenv';

dotenv.config();

const databaseConfig: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    schema?: string;
} = {
    host: process.env.DB_HOST || process.env.DB_HOSTNAME || 'localhost',
    port: Number(process.env.DB_PORT || process.env.PGPORT || 5432),
    user: process.env.DB_USER || process.env.POSTGRES_USER || 'postgres',
    password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || '',
    database: process.env.DB_DATABASE || process.env.DB_NAME || process.env.POSTGRES_DB || 'work_job',
    schema: process.env.DB_SCHEMA || 'public'
};

export default databaseConfig;