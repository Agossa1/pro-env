"use strict";
/*
|--------------------------------------------------------------------------
| SIGIE — Template Email : Bienvenue / Invitation
|--------------------------------------------------------------------------
| Template envoyé lors de la création d'un compte par un administrateur.
|--------------------------------------------------------------------------
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.welcomeEmailTemplate = welcomeEmailTemplate;
function welcomeEmailTemplate(params) {
    const { fullName, email, roleName, loginUrl } = params;
    return {
        subject: `SIGIE — Votre accès a été créé`,
        html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bienvenue sur SIGIE</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

          <!-- EN-TÊTE -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a3c5e 0%,#2563a8 100%);padding:36px 40px;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:13px;color:#a8c7f0;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Système Intégré de Gestion</p>
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">SIGIE</h1>
            </td>
          </tr>

          <!-- CORPS -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#1a2f4a;">Bienvenue, ${fullName} 👋</h2>
              <p style="margin:0 0 24px;font-size:15px;color:#4a5568;line-height:1.7;">
                Votre compte <strong>${roleName}</strong> est maintenant <strong style="color:#16a34a;">actif</strong>.
                Vous pouvez vous connecter avec votre adresse email et le mot de passe temporaire qui vous a été fourni lors de la création de votre compte.
              </p>

              <!-- BLOC IDENTIFIANTS -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7faff;border:1px solid #dce8f8;border-radius:8px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 16px;font-size:13px;font-weight:600;color:#2563a8;letter-spacing:1px;text-transform:uppercase;">Vos informations</p>
                    <table width="100%" cellpadding="6" cellspacing="0">
                      <tr>
                        <td style="font-size:13px;color:#718096;width:140px;">Adresse e-mail</td>
                        <td style="font-size:14px;font-weight:600;color:#1a2f4a;">${email}</td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;color:#718096;">Votre rôle</td>
                        <td style="font-size:14px;font-weight:600;color:#1a2f4a;">${roleName}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- AVERTISSEMENT -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:0 6px 6px 0;margin-bottom:28px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;font-size:13px;color:#15803d;line-height:1.6;">
                      ✅ <strong>Votre compte est actif.</strong> Connectez-vous et changez votre mot de passe dès que possible.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- BOUTON CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 32px;">
                    <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#1a3c5e 0%,#2563a8 100%);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:8px;letter-spacing:0.3px;">
                      Se connecter à SIGIE →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- PIED DE PAGE -->
          <tr>
            <td style="background:#f7faff;border-top:1px solid #e2eaf4;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#718096;">
                Ce message est généré automatiquement par la plateforme SIGIE.
              </p>
              <p style="margin:0;font-size:12px;color:#a0aec0;">
                En cas de problème, contactez votre administrateur territorial.
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
//# sourceMappingURL=welcome.template.js.map