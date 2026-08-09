"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
const env_1 = require("./env");
exports.appConfig = {
    app: {
        port: env_1.env.PORT,
        env: env_1.env.NODE_ENV,
        isProduction: env_1.env.NODE_ENV === 'production',
    },
    db: {
        host: env_1.env.DB_HOST,
        port: env_1.env.DB_PORT,
        user: env_1.env.DB_USER,
        password: env_1.env.DB_PASSWORD,
        database: env_1.env.DB_NAME,
    },
    auth: {
        jwtSecret: env_1.env.JWT_SECRET,
        refreshSecret: env_1.env.REFRESH_SECRET,
        expiresAccessSecret: env_1.env.EXPIRES_ACCESS_SECRET,
        expiresRefreshSecret: env_1.env.EXPIRES_REFRESH_SECRET,
    },
    mailer: {
        host: env_1.env.SMTP_HOST,
        port: env_1.env.SMTP_PORT,
        user: env_1.env.SMTP_USER,
        pass: env_1.env.SMTP_PASS,
        from: env_1.env.MAIL_FROM,
        fromName: env_1.env.MAIL_FROM_NAME,
    }
};
//# sourceMappingURL=appConfig.js.map