/*
 * Mailer Utility — SendGrid API HTTP
 * ─────────────────────────────────────────────────────────────
 * Remplace nodemailer SMTP (bloqué sur Render Free/Starter sur
 * les ports 587/465) par l'API HTTP SendGrid, qui ne nécessite
 * aucune connexion TCP sortante sur un port SMTP.
 *
 * Variable d'env requise : SENDGRID_API_KEY
 * ─────────────────────────────────────────────────────────────
 */

import sgMail from '@sendgrid/mail';
import { appConfig } from '../../config/app/appConfig';
import { logger } from '../../config/loggers/logger';

interface SendMailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: Array<{
        content: string;   // base64
        filename: string;
        type?: string;
        disposition?: string;
    }>;
}

export class Mailer {
    constructor() {
        const apiKey = process.env.SENDGRID_API_KEY;
        if (!apiKey) {
            logger.error('🚨 SENDGRID_API_KEY est absent — les emails ne seront pas envoyés.');
        } else {
            sgMail.setApiKey(apiKey);
            logger.info('✅ SendGrid configuré et prêt.');
        }
    }

    /**
     * Envoie un email via l'API HTTP SendGrid.
     */
    public async sendMail(options: SendMailOptions): Promise<void> {
        const apiKey = process.env.SENDGRID_API_KEY;
        if (!apiKey) {
            logger.warn(`📧 Email non envoyé (SENDGRID_API_KEY absent) : ${options.to} — ${options.subject}`);
            return;
        }

        const msg = {
            to:      options.to,
            from: {
                email: appConfig.mailer.from,
                name:  appConfig.mailer.fromName,
            },
            subject: options.subject,
            html:    options.html,
            text:    options.text || '',
            // Pièces jointes (format SendGrid base64)
            ...(options.attachments?.length ? {
                attachments: options.attachments.map((a) => ({
                    content:     a.content,
                    filename:    a.filename,
                    type:        a.type ?? 'application/octet-stream',
                    disposition: a.disposition ?? 'attachment',
                })),
            } : {}),
        };


        try {
            await sgMail.send(msg);
            logger.info(`📧 Email envoyé via SendGrid à ${options.to}`);
        } catch (error: any) {
            const detail = error?.response?.body ?? error?.message ?? error;
            logger.error('❌ Erreur SendGrid :', detail);
            throw new Error('Failed to send email');
        }
    }
}

// Singleton instance
export const mailer = new Mailer();
