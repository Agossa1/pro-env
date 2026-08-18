import dotenv from 'dotenv';
import { z } from 'zod';

// On charge les variables d'environnement depuis le fichier .env
dotenv.config();

// On définit un schéma de validation avec Zod pour garantir que l'app ne démarre pas 
// s'il manque des configurations critiques
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(() => 4000),
  
  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().transform(Number).default(() => 5432),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),

  // Cache
  REDIS_URL: z.string().url().default('redis://localhost:6379'),

  // Security
  JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 chars"),
  REFRESH_SECRET: z.string().min(10, "REFRESH_SECRET must be at least 10 chars"),
  JWT_EXPIRES_IN: z.string().default('15m'),
  EXPIRES_ACCESS_SECRET: z.string().default('15m'),
  EXPIRES_REFRESH_SECRET: z.string().default('7d'),
  OTP_EXPIRES_IN_MINUTES:  z.string().default('1min'),
  META_TOKEN:z.string().min(10, 'Meta token must be at least 10 chars '),
  META_PHONE_NUMBER_ID:z.string().min(8, 'Phone number Id be at least 8 chars'),

  // Email — SendGrid API HTTP (remplace SMTP bloqué sur Render)
  SENDGRID_API_KEY: z.string().optional(),  // requis en prod, optionnel en dev
  MAIL_FROM:        z.string().email(),
  MAIL_FROM_NAME:   z.string().default('HSE-TERRA'),

  // SMTP (conservé uniquement pour compatibilité locale — non utilisé en prod)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Erreur de configuration - Variables d\'environnement manquantes ou invalides :');
  console.error(JSON.stringify(_env.error.format(), null, 2));
  process.exit(1);
}

export const env = _env.data;