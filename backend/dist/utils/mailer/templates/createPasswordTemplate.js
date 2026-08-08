"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPasswordTemplate = void 0;
/**
 * Create Password Email Template
 * Sent to new users registered by administrators to set their password.
 */
const createPasswordTemplate = (firstName, resetLink, otpCode) => {
    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Création de votre compte HSE TERRA</title>
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            .header { background-color: #008751; padding: 30px; text-align: center; border-bottom: 5px solid #FFD000; }
            .header h1 { color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px; }
            .content { padding: 40px; text-align: center; color: #374151; }
            .content h2 { margin-top: 0; color: #111827; }
            .content p { line-height: 1.6; font-size: 16px; color: #6b7280; }
            .btn { display: inline-block; padding: 14px 30px; background-color: #008751; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; box-shadow: 0 4px 10px rgba(0, 135, 81, 0.3); }
            .otp-container { background-color: #f0fdf4; border: 2px dashed #008751; border-radius: 8px; padding: 20px; margin: 30px 0; display: inline-block; }
            .otp-code { font-size: 32px; font-weight: bold; color: #008751; letter-spacing: 8px; margin: 0; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
            .logo { font-size: 24px; font-weight: bold; color: white; text-transform: uppercase; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">HSE TERRA</div>
            </div>
            <div class="content">
                <h2>Bonjour ${firstName},</h2>
                <p>Un administrateur a créé votre compte sur la plateforme <strong>HSE TERRA</strong>.</p>
                <p>Pour finaliser la création de votre compte et définir votre mot de passe, veuillez cliquer sur le bouton ci-dessous :</p>
                
                <p style="margin-top: 25px;">
                    <a href="${resetLink}" class="btn" style="color: white !important;">Créer mon mot de passe</a>
                </p>
                
                <p style="margin-top: 25px; font-size: 14px;">Si le bouton ne fonctionne pas, vous pouvez utiliser le code de sécurité suivant sur la page de réinitialisation :</p>
                <div class="otp-container">
                    <p class="otp-code">${otpCode}</p>
                </div>
                
                <p>Ce lien et ce code sont valables pendant <strong>24 heures</strong>.</p>
            </div>
            <div class="footer">
                <p>&copy; 2026 HSE TERRA - Supervision État - République du Bénin.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};
exports.createPasswordTemplate = createPasswordTemplate;
//# sourceMappingURL=createPasswordTemplate.js.map