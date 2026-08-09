"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMailer = exports.AuthMailer = void 0;
const mailer_1 = require("./mailer");
const otpTemplate_1 = require("./templates/otpTemplate");
const welcomeTemplate_1 = require("./templates/welcomeTemplate");
const createPasswordTemplate_1 = require("./templates/createPasswordTemplate");
const sigieTemplates_1 = require("./templates/sigieTemplates");
const logger_1 = require("../../config/loggers/logger");
/**
 * Service spécialisé pour les emails liés à l'authentification.
 * Utilise l'instance de Mailer de base.
 */
class AuthMailer {
    constructor(mailerInstance = mailer_1.mailer) {
        this.mailerInstance = mailerInstance;
    }
    /**
     * Envoie le code de vérification (OTP) à l'utilisateur.
     */
    async sendVerificationCode(email, firstName, otpCode, setupLink) {
        try {
            await this.mailerInstance.sendMail({
                to: email,
                subject: 'HSE-TERA - Code de vérification',
                html: (0, otpTemplate_1.otpTemplate)(firstName, otpCode, setupLink),
            });
            logger_1.logger.info(`OTP sent successfully to ${email}`);
        }
        catch (error) {
            logger_1.logger.error(`Error sending OTP to ${email}:`, error);
            throw new Error('Failed to send verification code');
        }
    }
    /**
     * Envoie l'email de bienvenue après validation du compte.
     */
    async sendWelcomeEmail(email, firstName) {
        try {
            await this.mailerInstance.sendMail({
                to: email,
                subject: 'Bienvenue chez HSE-TERA !',
                html: (0, welcomeTemplate_1.welcomeTemplate)(firstName),
            });
            logger_1.logger.info(`Welcome email sent successfully to ${email}`);
        }
        catch (error) {
            logger_1.logger.error(`Error sending welcome email to ${email}:`, error);
            // On ne bloque pas forcément le flux pour un mail de bienvenue
        }
    }
    /**
     * Envoie l'email de création de mot de passe lors de l'ajout d'un utilisateur par l'admin.
     */
    async sendPasswordCreationEmail(email, firstName, resetLink, otpCode) {
        try {
            await this.mailerInstance.sendMail({
                to: email,
                subject: 'HSE TERRA - Création de votre compte',
                html: (0, createPasswordTemplate_1.createPasswordTemplate)(firstName, resetLink, otpCode),
            });
            logger_1.logger.info(`Password creation email sent successfully to ${email}`);
        }
        catch (error) {
            logger_1.logger.error(`Error sending password creation email to ${email}:`, error);
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
    async sendPasswordSetupAndVerification(email, firstName, otpCode, setupLink) {
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
            logger_1.logger.info(`Password setup and verification email sent successfully to ${email}`);
        }
        catch (error) {
            logger_1.logger.error(`Error sending password setup email to ${email}:`, error);
            throw new Error('Failed to send password setup and verification email');
        }
    }
    /**
     * SIGIE — Envoie le code OTP de vérification lors de la création d'un compte.
     */
    async sendSigieOtp(email, fullName, otpCode, activateLink) {
        try {
            await this.mailerInstance.sendMail({
                to: email,
                subject: `SIGIE — Activez votre compte : code ${otpCode}`,
                html: (0, sigieTemplates_1.sigieOtpTemplate)(fullName, otpCode, activateLink),
            });
            logger_1.logger.info(`SIGIE OTP envoyé à ${email}`);
        }
        catch (error) {
            logger_1.logger.error(`Erreur envoi OTP SIGIE à ${email}:`, error);
            throw new Error('Failed to send SIGIE OTP');
        }
    }
    /**
     * SIGIE — Envoie l'email de bienvenue après vérification du compte.
     */
    async sendSigieWelcome(email, fullName, roleName) {
        try {
            const loginUrl = process.env.APP_FRONTEND_URL || 'http://localhost:3000/login';
            await this.mailerInstance.sendMail({
                to: email,
                subject: 'SIGIE — Votre compte est activé',
                html: (0, sigieTemplates_1.sigieWelcomeTemplate)(fullName, email, roleName, loginUrl),
            });
            logger_1.logger.info(`SIGIE Welcome envoyé à ${email}`);
        }
        catch (error) {
            logger_1.logger.error(`Erreur envoi Welcome SIGIE à ${email}:`, error);
            // Ne bloque pas le flux
        }
    }
}
exports.AuthMailer = AuthMailer;
// Instance singleton
exports.authMailer = new AuthMailer();
//# sourceMappingURL=authMailer.js.map