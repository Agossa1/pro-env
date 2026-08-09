
import nodemailer from 'nodemailer';
import { appConfig } from '../../config/app/appConfig';
import { logger } from '../../config/loggers/logger';

interface SendMailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: any[];
}

/**
 * Mailer Utility
 * Handles SMTP transporter creation and email sending
 */
export class Mailer {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: appConfig.mailer.host,
            port: appConfig.mailer.port,
            secure: appConfig.mailer.port === 465, // true for 465, false for other ports
            auth: {
                user: appConfig.mailer.user,
                pass: appConfig.mailer.pass,
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
    private async verifyConnection() {
        try {
            await this.transporter.verify();
            logger.info('✅ SMTP Transporter connected and ready');
        } catch (error) {
            logger.error('❌ SMTP Connection Error:', error);
        }
    }

    /**
     * Sends an email
     * @param options Mail options (to, subject, html, text, attachments)
     */
    public async sendMail(options: SendMailOptions): Promise<void> {
        try {
            const info = await this.transporter.sendMail({
                from: `"${appConfig.mailer.fromName}" <${appConfig.mailer.from}>`,
                to: options.to,
                subject: options.subject,
                text: options.text || '',
                html: options.html,
                attachments: options.attachments,
            });

            logger.info(`📧 Email sent: ${info.messageId} to ${options.to}`);
        } catch (error) {
            logger.error('❌ Error sending email:', error);
            throw new Error('Failed to send email');
        }
    }
}

// Singleton instance
export const mailer = new Mailer();
