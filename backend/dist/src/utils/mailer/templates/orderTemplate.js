"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderConfirmationTemplate = void 0;
/**
 * Order Confirmation Email Template
 */
const orderConfirmationTemplate = (firstName, orderId, totalAmount) => {
    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation de commande Doto</title>
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            .header { background-color: #10b981; padding: 30px; text-align: center; color: white; }
            .content { padding: 40px; color: #374151; }
            .order-badge { background-color: #f0fdf4; color: #10b981; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 14px; }
            .total-box { margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #10b981; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; }
            .btn { display: inline-block; padding: 12px 25px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; margin-top: 25px; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Merci pour votre confiance !</h1>
            </div>
            <div class="content">
                <h2>Bonne nouvelle, ${firstName} !</h2>
                <p>Votre commande <span class="order-badge">#${orderId.substring(0, 8).toUpperCase()}</span> a bien été reçue par la pharmacie.</p>
                
                <p>Nos pharmaciens préparent actuellement vos produits avec soin. Un livreur vous sera attribué dès que la commande sera prête.</p>
                
                <div class="total-box">
                    <p style="margin: 0;">Total de la commande : <strong>${totalAmount} CFA</strong></p>
                </div>
                
                <a href="#" class="btn">Suivre ma commande</a>
                
                <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">Vous recevrez une notification dès que votre livreur sera en route.</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 Doto - Votre santé, livrée chez vous.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};
exports.orderConfirmationTemplate = orderConfirmationTemplate;
//# sourceMappingURL=orderTemplate.js.map