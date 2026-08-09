"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const databaseConfig = {
    host: process.env.DB_HOST || process.env.DB_HOSTNAME || 'localhost',
    port: Number(process.env.DB_PORT || process.env.PGPORT || 5432),
    user: process.env.DB_USER || process.env.POSTGRES_USER || 'postgres',
    password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || '',
    database: process.env.DB_DATABASE || process.env.DB_NAME || process.env.POSTGRES_DB || 'work_job',
    schema: process.env.DB_SCHEMA || 'public'
};
exports.default = databaseConfig;
//# sourceMappingURL=database.js.map