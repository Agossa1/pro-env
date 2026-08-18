"use strict";
/*
 * Mailer Utility — Resend API
 * ─────────────────────────────────────────────────────
 * Utilise le service Resend (API HTTP) — aucun port SMTP requis.
 *
 * Variable d'env requise : RESEND_API_KEY
 * ─────────────────────────────────────────────────────
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailer = exports.Mailer = void 0;
const resend_1 = require("resend");
const appConfig_1 = require("../../config/app/appConfig");
const logger_1 = require("../../config/loggers/logger");
class Mailer {
    constructor() {
        this.resend = null;
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            logger_1.logger.error('🚨 RESEND_API_KEY est absent — les emails ne seront pas envoyés.');
        }
        else {
            this.resend = new resend_1.Resend(apiKey);
            logger_1.logger.info('✅ Resend configuré et prêt.');
        }
    }
    /**
     * Envoie un email via l'API Resend.
     */
    async sendMail(options) {
        if (!this.resend) {
            logger_1.logger.warn(`📧 Email non envoyé (RESEND_API_KEY absent) : ${options.to} — ${options.subject}`);
            return;
        }
        try {
            const { error } = await this.resend.emails.send({
                from: `${appConfig_1.appConfig.mailer.fromName} <${appConfig_1.appConfig.mailer.from}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            });
            if (error) {
                logger_1.logger.error('❌ Erreur Resend :', error);
                throw new Error(error.message || 'Failed to send email');
            }
            logger_1.logger.info(`📧 Email envoyé via Resend à ${options.to}`);
        }
        catch (error) {
            logger_1.logger.error('❌ Erreur Resend :', error?.message ?? error);
            throw new Error('Failed to send email');
        }
    }
}
exports.Mailer = Mailer;
// Singleton instance
exports.mailer = new Mailer();
//# sourceMappingURL=mailer.js.map