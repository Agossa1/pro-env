import { mailer, Mailer } from './mailer';
import { otpTemplate } from './templates/otpTemplate';
import { welcomeTemplate } from './templates/welcomeTemplate';
import { createPasswordTemplate } from './templates/createPasswordTemplate';
import { sigieOtpTemplate, sigieWelcomeTemplate } from './templates/sigieTemplates';
import { logger } from '../../config/loggers/logger';

/**
 * Service spécialisé pour les emails liés à l'authentification.
 * Utilise l'instance de Mailer de base.
 */
export class AuthMailer {
    constructor(private readonly mailerInstance: Mailer = mailer) {}

    /**
     * Envoie le code de vérification (OTP) à l'utilisateur.
     */
    public async sendVerificationCode(email: string, firstName: string, otpCode: string, setupLink?: string): Promise<void> {
        try {
            await this.mailerInstance.sendMail({
                to: email,
                subject: 'HSE-TERA - Code de vérification',
                html: otpTemplate(firstName, otpCode, setupLink),
            });
            logger.info(`OTP sent successfully to ${email}`);
        } catch (error) {
            logger.error(`Error sending OTP to ${email}:`, error);
            throw new Error('Failed to send verification code');
        }
    }

    /**
     * Envoie l'email de bienvenue après validation du compte.
     */
    public async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
        try {
            await this.mailerInstance.sendMail({
                to: email,
                subject: 'Bienvenue chez HSE-TERA !',
                html: welcomeTemplate(firstName),
            });
            logger.info(`Welcome email sent successfully to ${email}`);
        } catch (error) {
            logger.error(`Error sending welcome email to ${email}:`, error);
            // On ne bloque pas forcément le flux pour un mail de bienvenue
        }
    }

    /**
     * Envoie l'email de création de mot de passe lors de l'ajout d'un utilisateur par l'admin.
     */
    public async sendPasswordCreationEmail(email: string, firstName: string, resetLink: string, otpCode: string): Promise<void> {
        try {
            await this.mailerInstance.sendMail({
                to: email,
                subject: 'HSE TERRA - Création de votre compte',
                html: createPasswordTemplate(firstName, resetLink, otpCode),
            });
            logger.info(`Password creation email sent successfully to ${email}`);
        } catch (error) {
            logger.error(`Error sending password creation email to ${email}:`, error);
            throw new Error('Failed to send password creation email');
        }
    }

    /**
     * Envoie un e-mail contenant le code de vérification ET le lien de création de mot de passe.
     * Intégré à l'intérieur de la classe AuthMailer et utilisant mailerInstance.
     */
       /**
     * Envoie un e-mail contenant le code de vérification ET le lien de création de mot de passe.
     * Version sécurisée avec HTML intégré pour garantir l'affichage du lien et du code.
     */
    public async sendPasswordSetupAndVerification(
        email: string, 
        firstName: string, 
        otpCode: string, 
        setupLink: string
    ): Promise<void> {
        try {
            await this.mailerInstance.sendMail({
                to: email,
                subject: 'Activez votre compte et configurez votre mot de passe',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                        <h2>Bonjour ${firstName},</h2>
                        <p>Bienvenue sur notre plateforme ! Votre compte a été créé avec succès.</p>
                        
                        <p><strong>Step 1 :</strong> Utilisez le code de vérification ci-dessous pour valider votre identité :</p>
                        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 4px;">
                            ${otpCode}
                        </div>

                        <p><strong>Step 2 :</strong> Cliquez sur le bouton ci-dessous pour configurer votre mot de passe :</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${setupLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                                Définir mon mot de passe
                            </a>
                        </div>

                        <p style="font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
                            Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br>
                            <a href="${setupLink}" style="color: #007bff;">${setupLink}</a>
                        </p>
                    </div>
                `,
            });
            logger.info(`Password setup and verification email sent successfully to ${email}`);
        } catch (error) {
            logger.error(`Error sending password setup email to ${email}:`, error);
            throw new Error('Failed to send password setup and verification email');
        }
    }

    /**
     * SIGIE — Envoie le code OTP de vérification lors de la création d'un compte.
     */
    public async sendSigieOtp(email: string, fullName: string, otpCode: string, activateLink?: string): Promise<void> {
        try {
            await this.mailerInstance.sendMail({
                to: email,
                subject: `SIGIE — Activez votre compte : code ${otpCode}`,
                html: sigieOtpTemplate(fullName, otpCode, activateLink),
            });
            logger.info(`SIGIE OTP envoyé à ${email}`);
        } catch (error) {
            logger.error(`Erreur envoi OTP SIGIE à ${email}:`, error);
            throw new Error('Failed to send SIGIE OTP');
        }
    }

    /**
     * SIGIE — Envoie l'email de bienvenue après vérification du compte.
     */
    public async sendSigieWelcome(email: string, fullName: string, roleName: string): Promise<void> {
        try {
            const loginUrl = process.env.APP_FRONTEND_URL || 'http://localhost:3000/login';
            await this.mailerInstance.sendMail({
                to: email,
                subject: 'SIGIE — Votre compte est activé',
                html: sigieWelcomeTemplate(fullName, email, roleName, loginUrl),
            });
            logger.info(`SIGIE Welcome envoyé à ${email}`);
        } catch (error) {
            logger.error(`Erreur envoi Welcome SIGIE à ${email}:`, error);
            // Ne bloque pas le flux
        }
    }

    /**
     * SIGIE — Envoie le code OTP pour réinitialiser le mot de passe.
     */
    public async sendSigiePasswordReset(email: string, fullName: string, otpCode: string, resetLink: string): Promise<void> {
        try {
            await this.mailerInstance.sendMail({
                to: email,
                subject: `SIGIE — Réinitialisation de votre mot de passe`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                        <h2>Bonjour ${fullName},</h2>
                        <p>Vous avez demandé à réinitialiser votre mot de passe sur SIGIE.</p>
                        
                        <p>Voici votre code de sécurité à 6 chiffres :</p>
                        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 4px;">
                            ${otpCode}
                        </div>

                        <p>Cliquez sur le lien suivant pour choisir un nouveau mot de passe :</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                                Réinitialiser mon mot de passe
                            </a>
                        </div>
                        <p style="font-size: 14px; color: #666;">Ce code expire dans 15 minutes.</p>
                        <p style="font-size: 12px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
                            Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.
                        </p>
                    </div>
                `,
            });
            logger.info(`SIGIE Password Reset envoyé à ${email}`);
        } catch (error) {
            logger.error(`Erreur envoi Password Reset SIGIE à ${email}:`, error);
            throw new Error('Failed to send SIGIE Password Reset OTP');
        }
    }

}
// Instance singleton
export const authMailer = new AuthMailer()
