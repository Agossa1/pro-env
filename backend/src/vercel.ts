import { createServer } from './server';
import PostgresDatabase from './config/database/postgres';
import { runMigrations } from './config/database/migrate';
import { seedTerritories } from './infra/seed/seed.territory';
import { logger } from './config/loggers/logger';
import { Request, Response } from 'express';

let app: any = null;

export default async function handler(req: Request, res: Response) {
    if (!app) {
        try {
            const database = new PostgresDatabase();
            await database.connect();
            
            // On Vercel serverless, we DO NOT run migrations and seeds on every cold start
            // as it causes 10-second timeouts. They should be run via CLI or separate script.
            
            app = await createServer(database);
            logger.info('✅ Serverless Express App Initialized');
        } catch (error: any) {
            logger.error('❌ Error initializing serverless app', error);
            
            // Add basic CORS headers so the frontend can actually read the 500 error instead of a CORS error
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
            return res.status(500).json({ error: 'Internal Server Error (Init)', details: error?.message });
        }
    }
    
    return app(req, res);
}
