import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { configureRoutes } from './routes';
import PostgresDatabase from './config/database/postgres';
import { errorMiddleware } from './shared/middlewares/error.middlewares';

const frontendUrl = process.env.FRONTEND_URL ?? 'https://frontend-w9nw.onrender.com';

export const createServer = async (db: PostgresDatabase) => {
    const app = express();

    // Rate limiting — protection anti brute-force sur /api/auth/login
    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 500, // 10 tentatives max par IP
        message: { success: false, message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
        standardHeaders: true,
        legacyHeaders: false,
    });

    // Rate limiting global — 200 requêtes/min par IP
    const globalLimiter = rateLimit({
        windowMs: 60 * 1000,
        max: 500,
        message: { success: false, message: 'Trop de requêtes. Ralentissez.' },
        standardHeaders: true,
        legacyHeaders: false,
    });

    app.use(globalLimiter);

    // Compression gzip — réduit fortement la taille des réponses GeoJSON
    app.use(compression({ threshold: 1024 }));

    // Serve static files from the uploads directory (used by the media module)
    app.use('/uploads', express.static('uploads'));

    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '500mb' }));
    app.use(helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "blob:", "https://*.cloudinary.com", "https://*.basemaps.cartocdn.com"],
                // ✅ Correction : on ajoute frontendUrl à connectSrc
                connectSrc: ["'self'", "wss:", "https://*.basemaps.cartocdn.com", frontendUrl],
                fontSrc: ["'self'", "https://fonts.openmaptiles.org"],
            },
        },
    }));
    app.use(cookieParser());

    const allowedOrigins = [
        frontendUrl,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:4000',
        'http://localhost:8081',
    ].filter(Boolean) as string[];

    app.use(cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
        exposedHeaders: ['Set-Cookie'],
    }));
    app.use(morgan('dev'));

    app.use('/api', configureRoutes(db))

    app.get('/health', (req: Request, res: Response) => {
        // Health check basique — le health check avancé (DB + Redis) est dans index.ts
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    app.use(errorMiddleware);

    return app;
};