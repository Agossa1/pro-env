import { env } from "./env"

export{}
export const appConfig = {
  app: {
    port: env.PORT,
    env: env.NODE_ENV,
    isProduction: env.NODE_ENV === 'production',
  },

  db: {
    url: env.DATABASE_URL,
  },

  auth: {
    jwtSecret: env.JWT_SECRET,
    refreshSecret: env.REFRESH_SECRET,
    expiresAccessSecret: env.EXPIRES_ACCESS_SECRET,
    expiresRefreshSecret: env.EXPIRES_REFRESH_SECRET,
  },

  mailer: {
    from:     env.MAIL_FROM,
    fromName: env.MAIL_FROM_NAME,
    host:     env.SMTP_HOST,
    port:     env.SMTP_PORT,
    user:     env.SMTP_USER,
    pass:     env.SMTP_PASS,
  }
}