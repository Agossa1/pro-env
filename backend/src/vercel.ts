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
            
            await runMigrations();
            
            try {
                await seedTerritories();
            } catch (seedError) {
                logger.error('⚠️  Seed territoires échoué :', seedError);
            }

            app = await createServer(database);
            logger.info('✅ Serverless Express App Initialized');
        } catch (error) {
            logger.error('❌ Error initializing serverless app', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    
    return app(req, res);
}
