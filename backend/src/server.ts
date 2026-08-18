import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { configureRoutes } from './routes';
import PostgresDatabase from './config/database/postgres';
import { errorMiddleware } from './shared/middlewares/error.middlewares';

// URL(s) du frontend (Render) — peut être multiple, séparé par des virgules
// Ex: FRONTEND_URL=https://frontend-w9nw.onrender.com,https://mondomaine.bj
const rawFrontendUrl = process.env.FRONTEND_URL?.trim();

// Alerte critique si FRONTEND_URL manque en prod
if (process.env.NODE_ENV === 'production' && !rawFrontendUrl) {
    console.error('🚨 FRONTEND_URL est absent en production ! Les requêtes CORS cross-origin seront refusées.');
}

export const createServer = async (db: PostgresDatabase) => {
    const app = express();

    /**
     * ============================
     * Rate Limiters
     * ============================
     */

    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 500,
        message: {
            success: false,
            message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
        },
        standardHeaders: true,
        legacyHeaders: false,
    });

    const globalLimiter = rateLimit({
        windowMs: 60 * 1000,
        max: 500,
        message: {
            success: false,
            message: 'Trop de requêtes. Ralentissez.',
        },
        standardHeaders: true,
        legacyHeaders: false,
    });

    app.use(globalLimiter);

    // Protection spécifique sur le login
    app.use('/api/auth/login', authLimiter);

    /**
     * ============================
     * Middlewares
     * ============================
     */

    app.use(compression({ threshold: 1024 }));

    app.use('/uploads', express.static('uploads'));

    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '500mb' }));

    /**
     * ============================
     * CORS
     * ============================
     */

    // Parse les origines multiples (séparées par des virgules)
    const frontendUrls = rawFrontendUrl
        ? rawFrontendUrl.split(',').map((u) => u.trim()).filter(Boolean)
        : [];

    const allowedOrigins = [
        ...frontendUrls,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:4000',
        'http://localhost:8081',
    ].filter((origin): origin is string => Boolean(origin));

    console.log('✅ Allowed Origins :', allowedOrigins);

    const corsOptions: CorsOptions = {
        origin(origin, callback) {
            console.log('🌍 Origin reçue :', origin);

            // Postman, curl, applications mobiles...
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.error('❌ Origin refusée :', origin);

            callback(new Error(`Not allowed by CORS: ${origin}`));
        },

        credentials: true,

        methods: [
            'GET',
            'POST',
            'PUT',
            'PATCH',
            'DELETE',
            'OPTIONS',
        ],

        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Cookie',
        ],

        exposedHeaders: ['Set-Cookie'],
    };

    app.use(cors(corsOptions));

    /**
     * ============================
     * Helmet
     * ============================
     */

    app.use(
        helmet({
            crossOriginResourcePolicy: {
                policy: 'cross-origin',
            },

            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],

                    scriptSrc: [
                        "'self'",
                        "'unsafe-inline'",
                    ],

                    styleSrc: [
                        "'self'",
                        "'unsafe-inline'",
                    ],

                    imgSrc: [
                        "'self'",
                        'data:',
                        'blob:',
                        'https://*.cloudinary.com',
                        'https://*.basemaps.cartocdn.com',
                    ],

                    connectSrc: [
                        "'self'",
                        'wss:',
                        'https://*.basemaps.cartocdn.com',
                        ...frontendUrls,
                    ],

                    fontSrc: [
                        "'self'",
                        'https://fonts.openmaptiles.org',
                    ],
                },
            },
        })
    );

    app.use(cookieParser());

    app.use(morgan('dev'));

    /**
     * ============================
     * Routes
     * ============================
     */

    app.use('/api', configureRoutes(db));

    app.get('/health', (req: Request, res: Response) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
        });
    });

    /**
     * ============================
     * Gestion des erreurs
     * ============================
     */

    app.use(errorMiddleware);

    return app;
};