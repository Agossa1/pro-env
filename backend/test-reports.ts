import { config } from 'dotenv';
config();
import { Pool } from 'pg';
import PostgresDatabase from './src/config/database/postgres';
import { ReportRepository } from './src/modules/reports/repositories/report.repositories';
import winston from 'winston';

const logger = winston.createLogger({
  transports: [new winston.transports.Console()]
});

async function test() {
  const db = new PostgresDatabase(logger);
  await db.connect();
  const repo = new ReportRepository(db, logger);
  
  console.log('Testing without filters (super_admin)...');
  const res = await repo.getAllReports({});
  console.log('Count:', res.total);
  
  process.exit(0);
}
test();
