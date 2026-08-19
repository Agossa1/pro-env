import nodemailer from 'nodemailer';
import { appConfig } from '../../config/app/appConfig';
import { logger } from '../../config/loggers/logger';

interface SendMailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export class Mailer {
    private transporter: nodemailer.Transporter | null = null;

    constructor() {
        const { host, port, user, pass } = appConfig.mailer;

        if (!host || !user || !pass) {
            logger.warn('🚨 Configuration SMTP incomplète. Les emails ne seront pas envoyés.');
        } else {
            this.transporter = nodemailer.createTransport({
                host: host,
                port: port || 587,
                secure: port === 465, // true pour 465, false pour les autres ports
                auth: {
                    user: user,
                    pass: pass,
                },
            });
            logger.info(`✅ Nodemailer configuré avec le serveur SMTP ${host}:${port}`);
        }
    }

    /**
     * Envoie un email via Nodemailer.
     */
    public async sendMail(options: SendMailOptions): Promise<void> {
        if (!this.transporter) {
            logger.warn(`📧 Email non envoyé (SMTP non configuré) : ${options.to} — ${options.subject}`);
            return;
        }

        try {
            await this.transporter.sendMail({
                from: `${appConfig.mailer.fromName} <${appConfig.mailer.from}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            });

            logger.info(`📧 Email envoyé via SMTP à ${options.to}`);
        } catch (error: any) {
            logger.error('❌ Erreur SMTP :', error?.message ?? error);
            throw new Error('Failed to send email');
        }
    }
}

// Singleton instance
export const mailer = new Mailer();
