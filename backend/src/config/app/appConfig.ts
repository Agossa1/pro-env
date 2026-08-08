import { env } from "./env"

export{}
export const appConfig = {
  app: {
    port: env.PORT,
    env: env.NODE_ENV,
    isProduction: env.NODE_ENV === 'production',
  },

  db: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  },

  auth: {
    jwtSecret: env.JWT_SECRET,
    refreshSecret: env.REFRESH_SECRET,
    expiresAccessSecret: env.EXPIRES_ACCESS_SECRET,
    expiresRefreshSecret: env.EXPIRES_REFRESH_SECRET,
  },

  mailer: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.MAIL_FROM,
    fromName: env.MAIL_FROM_NAME,
  }
}