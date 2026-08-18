"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
// On charge les variables d'environnement depuis le fichier .env
dotenv_1.default.config();
// On définit un schéma de validation avec Zod pour garantir que l'app ne démarre pas 
// s'il manque des configurations critiques
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().transform(Number).default(() => 4000),
    // Database
    DB_HOST: zod_1.z.string().default('localhost'),
    DB_PORT: zod_1.z.string().transform(Number).default(() => 5432),
    DB_USER: zod_1.z.string(),
    DB_PASSWORD: zod_1.z.string(),
    DB_NAME: zod_1.z.string(),
    // Cache
    REDIS_URL: zod_1.z.string().url().default('redis://localhost:6379'),
    // Security
    JWT_SECRET: zod_1.z.string().min(10, "JWT_SECRET must be at least 10 chars"),
    REFRESH_SECRET: zod_1.z.string().min(10, "REFRESH_SECRET must be at least 10 chars"),
    JWT_EXPIRES_IN: zod_1.z.string().default('15m'),
    EXPIRES_ACCESS_SECRET: zod_1.z.string().default('15m'),
    EXPIRES_REFRESH_SECRET: zod_1.z.string().default('7d'),
    OTP_EXPIRES_IN_MINUTES: zod_1.z.string().default('1min'),
    META_TOKEN: zod_1.z.string().min(10, 'Meta token must be at least 10 chars '),
    META_PHONE_NUMBER_ID: zod_1.z.string().min(8, 'Phone number Id be at least 8 chars'),
    // Email — Resend API (remplace SMTP bloqué sur Render)
    RESEND_API_KEY: zod_1.z.string().optional(), // requis en prod, optionnel en dev
    MAIL_FROM: zod_1.z.string().email(),
    MAIL_FROM_NAME: zod_1.z.string().default('SIGIE'),
    // SMTP (conservé uniquement pour compatibilité locale — non utilisé en prod)
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.string().transform(Number).optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.error('❌ Erreur de configuration - Variables d\'environnement manquantes ou invalides :');
    console.error(JSON.stringify(_env.error.format(), null, 2));
    process.exit(1);
}
exports.env = _env.data;
//# sourceMappingURL=env.js.map