"use strict";
/*
|--------------------------------------------------------------------------
| SIGIE — Service d'envoi d'emails (Mailer)
|--------------------------------------------------------------------------
| Utilise Nodemailer pour l'envoi. Lit la configuration depuis .env.
|--------------------------------------------------------------------------
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class MailerService {
    logger;
    transporter;
    constructor(logger) {
        this.logger = logger;
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.MAIL_HOST || 'smtp.gmail.com',
            port: Number(process.env.MAIL_PORT) || 587,
            secure: process.env.MAIL_SECURE === 'true',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
    }
    async send(options) {
        try {
            await this.transporter.sendMail({
                from: `"${process.env.MAIL_FROM_NAME || 'SIGIE'}" <${process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USER}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
            });
            this.logger.info(`Email envoyé à: ${options.to} | Sujet: ${options.subject}`);
        }
        catch (error) {
            this.logger.error(`Échec de l'envoi d'email à ${options.to}: ${error.message}`);
            // On ne bloque pas le flux : la création d'utilisateur est déjà faite
            // L'email peut être renvoyé via une autre action.
        }
    }
}
exports.MailerService = MailerService;
//# sourceMappingURL=mailer.service.js.map