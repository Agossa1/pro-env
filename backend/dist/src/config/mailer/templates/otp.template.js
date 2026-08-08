"use strict";
/*
|--------------------------------------------------------------------------
| SIGIE — Template Email : Code de vérification OTP
|--------------------------------------------------------------------------
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpEmailTemplate = otpEmailTemplate;
function otpEmailTemplate(params) {
    const { fullName, otp, expiresInMinutes } = params;
    // Découpe le code en chiffres individuels pour un affichage stylistique
    const digits = otp.split('');
    return {
        subject: `SIGIE — Votre code de vérification : ${otp}`,
        html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Code de vérification SIGIE</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

          <!-- EN-TÊTE -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a3c5e 0%,#2563a8 100%);padding:32px 40px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#a8c7f0;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Système Intégré de Gestion</p>
              <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;">SIGIE</h1>
            </td>
          </tr>

          <!-- CORPS -->
          <tr>
            <td style="padding:40px 40px 32px;text-align:center;">
              <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#718096;text-transform:uppercase;letter-spacing:1px;">Vérification du compte</p>
              <h2 style="margin:0 0 16px;font-size:21px;font-weight:700;color:#1a2f4a;">Bonjour, ${fullName}</h2>
              <p style="margin:0 0 32px;font-size:15px;color:#4a5568;line-height:1.7;">
                Utilisez le code ci-dessous pour activer votre compte SIGIE.<br/>
                Il est valable pendant <strong>${expiresInMinutes} minutes</strong>.
              </p>

              <!-- CODE OTP -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  ${digits.map(d => `
                  <td style="padding:0 5px;">
                    <span style="display:inline-block;width:44px;height:56px;line-height:56px;text-align:center;font-size:28px;font-weight:800;color:#1a3c5e;background:#f0f6ff;border:2px solid #dce8f8;border-radius:8px;font-family:monospace;">${d}</span>
                  </td>`).join('')}
                </tr>
              </table>

              <!-- AVERTISSEMENT EXPIRATION -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f0;border-left:4px solid #f59e0b;border-radius:0 6px 6px 0;margin-bottom:28px;text-align:left;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
                      ⏳ Ce code expire dans <strong>${expiresInMinutes} minutes</strong>. Ne le partagez avec personne.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#a0aec0;line-height:1.7;">
                Si vous n'avez pas demandé ce code, ignorez cet email. Votre compte restera inactif.
              </p>
            </td>
          </tr>

          <!-- PIED DE PAGE -->
          <tr>
            <td style="background:#f7faff;border-top:1px solid #e2eaf4;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#a0aec0;">
                Message automatique — Ne pas répondre à cet email. © SIGIE
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
    };
}
//# sourceMappingURL=otp.template.js.map