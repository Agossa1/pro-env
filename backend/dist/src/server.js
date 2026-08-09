"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = void 0;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const routes_1 = require("./routes");
const error_middlewares_1 = require("./shared/middlewares/error.middlewares");
const createServer = async (db) => {
    const app = (0, express_1.default)();
    // Rate limiting — protection anti brute-force sur /api/auth/login
    const authLimiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 500, // 10 tentatives max par IP
        message: { success: false, message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
        standardHeaders: true,
        legacyHeaders: false,
    });
    // Rate limiting global — 200 requêtes/min par IP
    const globalLimiter = (0, express_rate_limit_1.default)({
        windowMs: 60 * 1000,
        max: 500,
        message: { success: false, message: 'Trop de requêtes. Ralentissez.' },
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use(globalLimiter);
    // Compression gzip — réduit fortement la taille des réponses GeoJSON
    app.use((0, compression_1.default)({ threshold: 1024 }));
    // Serve static files from the uploads directory (used by the media module)
    app.use('/uploads', express_1.default.static('uploads'));
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '500mb' }));
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "blob:", "https://*.cloudinary.com", "https://*.basemaps.cartocdn.com"],
                connectSrc: ["'self'", "wss:", "https://*.basemaps.cartocdn.com"],
                fontSrc: ["'self'", "https://fonts.openmaptiles.org"],
            },
        },
    }));
    app.use((0, cookie_parser_1.default)());
    const allowedOrigins = [
        process.env.FRONTEND_URL,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:4000',
        'http://localhost:8081',
    ].filter(Boolean);
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
        exposedHeaders: ['Set-Cookie'],
    }));
    app.use((0, morgan_1.default)('dev'));
    app.use('/api', (0, routes_1.configureRoutes)(db));
    app.get('/health', (req, res) => {
        // Health check basique — le health check avancé (DB + Redis) est dans index.ts
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    app.use(error_middlewares_1.errorMiddleware);
    return app;
};
exports.createServer = createServer;
//# sourceMappingURL=server.js.map