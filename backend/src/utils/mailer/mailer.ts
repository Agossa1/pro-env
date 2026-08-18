/*
 * Mailer Utility — Resend API
 * ─────────────────────────────────────────────────────
 * Utilise le service Resend (API HTTP) — aucun port SMTP requis.
 *
 * Variable d'env requise : RESEND_API_KEY
 * ─────────────────────────────────────────────────────
 */

import { Resend } from 'resend';
import { appConfig } from '../../config/app/appConfig';
import { logger } from '../../config/loggers/logger';

interface SendMailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export class Mailer {
    private resend: Resend | null = null;

    constructor() {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            logger.error('🚨 RESEND_API_KEY est absent — les emails ne seront pas envoyés.');
        } else {
            this.resend = new Resend(apiKey);
            logger.info('✅ Resend configuré et prêt.');
        }
    }

    /**
     * Envoie un email via l'API Resend.
     */
    public async sendMail(options: SendMailOptions): Promise<void> {
        if (!this.resend) {
            logger.warn(`📧 Email non envoyé (RESEND_API_KEY absent) : ${options.to} — ${options.subject}`);
            return;
        }

        try {
            const { error } = await this.resend.emails.send({
                from: `${appConfig.mailer.fromName} <${appConfig.mailer.from}>`,
                to:      options.to,
                subject: options.subject,
                html:    options.html,
                text:    options.text,
            });

            if (error) {
                logger.error('❌ Erreur Resend :', error);
                throw new Error(error.message || 'Failed to send email');
            }

            logger.info(`📧 Email envoyé via Resend à ${options.to}`);
        } catch (error: any) {
            logger.error('❌ Erreur Resend :', error?.message ?? error);
            throw new Error('Failed to send email');
        }
    }
}

// Singleton instance
export const mailer = new Mailer();
