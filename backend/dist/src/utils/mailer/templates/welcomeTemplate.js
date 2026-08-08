"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.welcomeTemplate = void 0;
/**
 * Welcome Email Template
 * Sent to new users after registration
 */
const welcomeTemplate = (firstName) => {
    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenue chez Doto</title>
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0fdf4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
            .hero { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 50px 30px; text-align: center; color: white; }
            .hero h1 { margin: 0; font-size: 32px; font-weight: 800; }
            .content { padding: 40px; color: #374151; line-height: 1.7; }
            .features { display: flex; flex-wrap: wrap; margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 30px; }
            .feature-item { width: 45%; margin-bottom: 20px; padding-right: 5%; }
            .feature-icon { color: #10b981; font-size: 20px; margin-bottom: 8px; font-weight: bold; }
            .footer { background-color: #f9fafb; padding: 30px; text-align: center; font-size: 13px; color: #9ca3af; }
            .btn { display: inline-block; padding: 14px 30px; background-color: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="hero">
                <h1>Bienvenue parmi nous !</h1>
                <p style="font-size: 18px; opacity: 0.9; margin-top: 10px;">La santé n'attend pas, Doto non plus.</p>
            </div>
            <div class="content">
                <h2 style="color: #111827;">Bonjour ${firstName},</h2>
                <p>Nous sommes ravis de vous accueillir dans la communauté **Doto**. Notre mission est simple : vous simplifier l'accès aux soins de santé en livrant vos médicaments directement chez vous, en un temps record.</p>
                
                <p>Voici ce que vous pouvez faire dès maintenant :</p>
                
                <div class="features">
                    <div class="feature-item">
                        <div class="feature-icon">💊 Commande Express</div>
                        <p style="font-size: 14px; margin: 0;">Trouvez vos médicaments et commandez en 2 clics.</p>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">📄 Ordonnance Photo</div>
                        <p style="font-size: 14px; margin: 0;">Scannez votre ordonnance, on s'occupe du reste.</p>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">🚀 Suivi en Temps Réel</div>
                        <p style="font-size: 14px; margin: 0;">Suivez votre livreur sur la carte jusqu'à votre porte.</p>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">👨‍⚕️ Conseil Pro</div>
                        <p style="font-size: 14px; margin: 0;">Échangez avec des pharmaciens certifiés.</p>
                    </div>
                </div>

                <div style="text-align: center; margin-top: 40px;">
                    <a href="#" class="btn">Découvrir Doto</a>
                </div>
            </div>
            <div class="footer">
                <p>Besoin d'aide ? Répondez simplement à cet e-mail.</p>
                <p>&copy; 2024 Doto - Votre santé, notre priorité.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};
exports.welcomeTemplate = welcomeTemplate;
//# sourceMappingURL=welcomeTemplate.js.map