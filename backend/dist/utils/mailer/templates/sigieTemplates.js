"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sigieWelcomeTemplate = exports.sigieOtpTemplate = void 0;
/**
 * SIGIE — Template OTP de vérification de compte (épuré)
 */
const sigieOtpTemplate = (fullName, otpCode, activateLink) => {
    const digits = otpCode.split('');
    const activationSection = activateLink
        ? `
        <p style="margin:0 0 16px;text-align:center;">
          <a href="${activateLink}"
             style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 32px;border-radius:10px;">
            Activer mon compte →
          </a>
        </p>
        <p style="margin:0 0 24px;font-size:12px;color:#9ca3af;text-align:center;">
          Si le bouton ne fonctionne pas :<br/>
          <a href="${activateLink}" style="color:#16a34a;word-break:break-all;">${activateLink}</a>
        </p>`
        : '';
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Votre code d'activation — SIGIE</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0"
             style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.07);">

        <!-- EN-TÊTE -->
        <tr>
          <td style="background:#16a34a;padding:28px 40px;text-align:center;">
            <h1 style="margin:0;font-size:22px;font-weight:700;color:#fff;letter-spacing:1px;">SIGIE</h1>
            <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.7);">Système Intégré de Gestion</p>
          </td>
        </tr>

        <!-- CORPS -->
        <tr>
          <td style="padding:36px 40px;text-align:center;">

            <p style="margin:0 0 4px;font-size:12px;color:#6b7280;">VÉRIFICATION DU COMPTE</p>
            <h2 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#111827;">Bonjour, ${fullName}</h2>

            <p style="margin:0 0 24px;font-size:14px;color:#4b5563;line-height:1.6;">
              Voici votre code d'activation valable <strong>15 minutes</strong>.
            </p>

            <!-- CODE OTP -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
              <tr>
                ${digits.map(d => `
                <td style="padding:0 4px;">
                  <span style="display:inline-block;width:40px;height:50px;line-height:50px;text-align:center;font-size:24px;font-weight:800;color:#16a34a;background:#f0fdf4;border:2px solid #bbf7d0;border-radius:10px;font-family:monospace;">${d}</span>
                </td>`).join('')}
              </tr>
            </table>

            <!-- AVERTISSEMENT -->
            <p style="margin:0 0 28px;font-size:12px;color:#92400e;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:10px 16px;">
              ⏱ Ce code expire dans 15 minutes. Ne le partagez avec personne.
            </p>

            ${activationSection}

            <p style="margin:0;font-size:12px;color:#9ca3af;">
              Si vous n'attendiez pas ce code, ignorez cet email.
            </p>

          </td>
        </tr>

        <!-- PIED DE PAGE -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">Message automatique — © SIGIE. Ne pas répondre.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
};
exports.sigieOtpTemplate = sigieOtpTemplate;
/**
 * SIGIE — Template de bienvenue (envoyé après la vérification OTP)
 */
const sigieWelcomeTemplate = (fullName, email, roleName, loginUrl) => {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Bienvenue sur SIGIE</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0"
             style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.07);">

        <!-- EN-TÊTE -->
        <tr>
          <td style="background:#16a34a;padding:28px 40px;text-align:center;">
            <h1 style="margin:0;font-size:22px;font-weight:700;color:#fff;letter-spacing:1px;">SIGIE</h1>
            <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.7);">Système Intégré de Gestion</p>
          </td>
        </tr>

        <!-- CORPS -->
        <tr>
          <td style="padding:36px 40px;">

            <h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#111827;">Bienvenue, ${fullName} 👋</h2>
            <p style="margin:0 0 24px;font-size:14px;color:#4b5563;line-height:1.6;">
              Votre compte <strong>${roleName}</strong> est maintenant
              <strong style="color:#16a34a;">actif</strong>.
            </p>

            <!-- INFOS COMPTE -->
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:24px;">
              <tr>
                <td style="padding:16px 20px;">
                  <table width="100%" cellpadding="6" cellspacing="0">
                    <tr>
                      <td style="font-size:12px;color:#6b7280;width:120px;">Email</td>
                      <td style="font-size:13px;font-weight:600;color:#111827;">${email}</td>
                    </tr>
                    <tr>
                      <td style="font-size:12px;color:#6b7280;">Rôle</td>
                      <td style="font-size:13px;font-weight:600;color:#111827;">${roleName}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- BOUTON -->
            <p style="margin:0 0 12px;text-align:center;">
              <a href="${loginUrl}"
                 style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 32px;border-radius:10px;">
                Se connecter →
              </a>
            </p>

            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
              Pensez à changer votre mot de passe dès la première connexion.
            </p>

          </td>
        </tr>

        <!-- PIED DE PAGE -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">© SIGIE — En cas de problème, contactez votre administrateur.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
};
exports.sigieWelcomeTemplate = sigieWelcomeTemplate;
//# sourceMappingURL=sigieTemplates.js.map