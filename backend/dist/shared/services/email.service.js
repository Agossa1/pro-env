"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer = __importStar(require("nodemailer"));
class EmailService {
    constructor(logger) {
        this.logger = logger;
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    /**
     * Envoie l'email contenant le code OTP pour la réinitialisation de mot de passe.
     */
    async sendPasswordResetEmail(to, otpCode) {
        const mailOptions = {
            from: `"HSE TERRA Support" <${process.env.SMTP_USER}>`,
            to,
            subject: 'HSE TERRA - Réinitialisation de votre mot de passe',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #2c3e50; text-align: center;">Réinitialisation de Mot de Passe</h2>
                    <p style="color: #4f4f4f; font-size: 16px;">Bonjour,</p>
                    <p style="color: #4f4f4f; font-size: 16px;">Vous avez demandé à réinitialiser votre mot de passe sur la plateforme HSE TERRA. Veuillez utiliser le code de sécurité suivant :</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="display: inline-block; padding: 15px 30px; font-size: 24px; font-weight: bold; color: #ffffff; background-color: #3498db; border-radius: 5px; letter-spacing: 4px;">
                            ${otpCode}
                        </span>
                    </div>
                    <p style="color: #4f4f4f; font-size: 16px;">Ce code est valide pendant <strong>15 minutes</strong>.</p>
                    <p style="color: #4f4f4f; font-size: 14px;">Si vous n'avez pas fait cette demande, vous pouvez ignorer cet email en toute sécurité.</p>
                    <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
                    <p style="color: #9e9e9e; font-size: 12px; text-align: center;">Ceci est un message automatique, merci de ne pas y répondre.</p>
                </div>
            `
        };
        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.info(`Password reset email sent to ${to}`);
        }
        catch (error) {
            this.logger.error('Error sending password reset email:', error);
            throw new Error('Erreur lors de l\'envoi de l\'email');
        }
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=email.service.js.map