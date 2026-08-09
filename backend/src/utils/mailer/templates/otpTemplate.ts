/**
 * OTP Email Template
 * Dédié à HSE-TERA - Gère le code de vérification simple ET l'ajout optionnel du lien de mot de passe.
 */
export const otpTemplate = (firstName: string, otpCode: string, setupLink?: string) => {
    // Sécurité anti-undefined : si le prénom est absent, on affiche "Collaborateur"
    const displayName = (firstName && firstName !== 'undefined') ? firstName : 'Collaborateur';

    // Génération dynamique de la section du bouton si un lien est fourni
    const passwordSetupSection = setupLink 
        ? `
        <div style="margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
            <p style="font-size: 16px; color: #374151; font-weight: bold; text-align: left;">👉 Étape 2 : Configurer votre mot de passe</p>
            <p style="line-height: 1.6; font-size: 15px; color: #6b7280; text-align: left;">Veuillez cliquer sur le bouton ci-dessous pour définir le mot de passe de votre compte (lien valable 24h) :</p>
            <div style="text-align: center; margin: 25px 0;">
                <a href="${setupLink}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; box-shadow: 0 2px 5px rgba(16,185,129,0.2);">
                    Définir mon mot de passe
                </a>
            </div>
            <p style="font-size: 12px; color: #9ca3af; text-align: left; background-color: #f9fafb; padding: 10px; border-radius: 4px; word-break: break-all;">
                Si le bouton ne fonctionne pas, copiez ce lien : <br>
                <a href="${setupLink}" style="color: #10b981;">${setupLink}</a>
            </p>
        </div>
        `
        : '';

    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vérification HSE-TERA</title>
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            .header { background-color: #10b981; padding: 30px; text-align: center; }
            .content { padding: 40px; text-align: center; color: #374151; }
            .content h2 { margin-top: 0; color: #111827; text-align: center; }
            .content p { line-height: 1.6; font-size: 16px; color: #6b7280; text-align: center; }
            .otp-container { background-color: #f0fdf4; border: 2px dashed #10b981; border-radius: 8px; padding: 20px; margin: 25px 0; display: inline-block; }
            .otp-code { font-size: 36px; font-weight: bold; color: #059669; letter-spacing: 8px; margin: 0; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
            .warning { font-size: 13px; color: #ef4444; margin-top: 25px; text-align: center; }
            .logo { font-size: 24px; font-weight: bold; color: white; text-transform: uppercase; letter-spacing: 1px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">HSE-TERA</div>
            </div>
            <div class="content">
                <h2>Bonjour ${displayName},</h2>
                <p>Bienvenue sur votre espace HSE-TERA. Pour sécuriser votre accès, veuillez suivre les étapes de validation nécessaires.</p>
                
                <p style="font-size: 16px; color: #374151; font-weight: bold; text-align: center; margin-top: 20px;">
                    ${setupLink ? '👉 Étape 1 : Valider votre identité' : 'Votre code de vérification'}
                </p>
                
                <div class="otp-container">
                    <p class="otp-code">${otpCode}</p>
                </div>
                
                <p>Ce code est valable pendant <strong>10 minutes</strong>. Ne le partagez jamais avec qui que ce soit.</p>
                
                <!-- Inclusion du bouton de mot de passe si setupLink est transmis -->
                ${passwordSetupSection}
                
                <p class="warning">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.</p>
            </div>
            <div class="footer">
                <p>&copy; 2026 HSE-TERA - Plateforme de gestion Environnement, Hygiène et Sécurité.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};
