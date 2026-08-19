"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailer = exports.Mailer = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const appConfig_1 = require("../../config/app/appConfig");
const logger_1 = require("../../config/loggers/logger");
class Mailer {
    constructor() {
        this.transporter = null;
        const { host, port, user, pass } = appConfig_1.appConfig.mailer;
        if (!host || !user || !pass) {
            logger_1.logger.warn('🚨 Configuration SMTP incomplète. Les emails ne seront pas envoyés.');
        }
        else {
            this.transporter = nodemailer_1.default.createTransport({
                host: host,
                port: port || 587,
                secure: port === 465, // true pour 465, false pour les autres ports
                auth: {
                    user: user,
                    pass: pass,
                },
            });
            logger_1.logger.info(`✅ Nodemailer configuré avec le serveur SMTP ${host}:${port}`);
        }
    }
    /**
     * Envoie un email via Nodemailer.
     */
    async sendMail(options) {
        if (!this.transporter) {
            logger_1.logger.warn(`📧 Email non envoyé (SMTP non configuré) : ${options.to} — ${options.subject}`);
            return;
        }
        try {
            await this.transporter.sendMail({
                from: `${appConfig_1.appConfig.mailer.fromName} <${appConfig_1.appConfig.mailer.from}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            });
            logger_1.logger.info(`📧 Email envoyé via SMTP à ${options.to}`);
        }
        catch (error) {
            logger_1.logger.error('❌ Erreur SMTP :', error?.message ?? error);
            throw new Error('Failed to send email');
        }
    }
}
exports.Mailer = Mailer;
// Singleton instance
exports.mailer = new Mailer();
//# sourceMappingURL=mailer.js.map