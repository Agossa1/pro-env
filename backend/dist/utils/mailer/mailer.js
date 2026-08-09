"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailer = exports.Mailer = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const appConfig_1 = require("../../config/app/appConfig");
const logger_1 = require("../../config/loggers/logger");
/**
 * Mailer Utility
 * Handles SMTP transporter creation and email sending
 */
class Mailer {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: appConfig_1.appConfig.mailer.host,
            port: appConfig_1.appConfig.mailer.port,
            secure: appConfig_1.appConfig.mailer.port === 465, // true for 465, false for other ports
            auth: {
                user: appConfig_1.appConfig.mailer.user,
                pass: appConfig_1.appConfig.mailer.pass,
            },
            tls: {
                // Do not fail on invalid certs
                rejectUnauthorized: false
            }
        });
        this.verifyConnection();
    }
    /**
     * Verifies the SMTP connection on startup
     */
    async verifyConnection() {
        try {
            await this.transporter.verify();
            logger_1.logger.info('✅ SMTP Transporter connected and ready');
        }
        catch (error) {
            logger_1.logger.error('❌ SMTP Connection Error:', error);
        }
    }
    /**
     * Sends an email
     * @param options Mail options (to, subject, html, text, attachments)
     */
    async sendMail(options) {
        try {
            const info = await this.transporter.sendMail({
                from: `"${appConfig_1.appConfig.mailer.fromName}" <${appConfig_1.appConfig.mailer.from}>`,
                to: options.to,
                subject: options.subject,
                text: options.text || '',
                html: options.html,
                attachments: options.attachments,
            });
            logger_1.logger.info(`📧 Email sent: ${info.messageId} to ${options.to}`);
        }
        catch (error) {
            logger_1.logger.error('❌ Error sending email:', error);
            throw new Error('Failed to send email');
        }
    }
}
exports.Mailer = Mailer;
// Singleton instance
exports.mailer = new Mailer();
//# sourceMappingURL=mailer.js.map