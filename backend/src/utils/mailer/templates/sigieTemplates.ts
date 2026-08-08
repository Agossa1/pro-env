/**
 * SIGIE — Template OTP de vérification de compte
 */
export const sigieOtpTemplate = (fullName: string, otpCode: string): string => {
  const digits = otpCode.split('');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Code de vérification SIGIE</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

        <!-- EN-TÊTE -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a3c5e 0%,#2563a8 100%);padding:32px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#a8c7f0;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Système Intégré de Gestion</p>
            <h1 style="margin:0;font-size:26px;font-weight:700;color:#fff;">SIGIE</h1>
          </td>
        </tr>

        <!-- CORPS -->
        <tr>
          <td style="padding:40px;text-align:center;">
            <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#718096;text-transform:uppercase;letter-spacing:1px;">Vérification du compte</p>
            <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#1a2f4a;">Bonjour, ${fullName}</h2>
            <p style="margin:0 0 28px;font-size:15px;color:#4a5568;line-height:1.7;">
              Utilisez le code ci-dessous pour activer votre compte.<br/>
              Il est valable pendant <strong>15 minutes</strong>.
            </p>

            <!-- CODE OTP — chiffres individuels -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
              <tr>
                ${digits.map(d => `
                <td style="padding:0 5px;">
                  <span style="display:inline-block;width:44px;height:56px;line-height:56px;text-align:center;font-size:28px;font-weight:800;color:#1a3c5e;background:#f0f6ff;border:2px solid #dce8f8;border-radius:8px;font-family:monospace;">${d}</span>
                </td>`).join('')}
              </tr>
            </table>

            <!-- EXPIRATION -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f0;border-left:4px solid #f59e0b;border-radius:0 6px 6px 0;margin-bottom:20px;text-align:left;">
              <tr>
                <td style="padding:12px 16px;">
                  <p style="margin:0;font-size:13px;color:#92400e;">
                    ⏳ Ce code expire dans <strong>15 minutes</strong>. Ne le partagez avec personne.
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:13px;color:#a0aec0;">
              Si vous n'attendiez pas ce code, ignorez cet email.
            </p>
          </td>
        </tr>

        <!-- PIED DE PAGE -->
        <tr>
          <td style="background:#f7faff;border-top:1px solid #e2eaf4;padding:18px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#a0aec0;">Message automatique — © SIGIE. Ne pas répondre.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * SIGIE — Template de bienvenue (envoyé après la vérification OTP)
 */
export const sigieWelcomeTemplate = (fullName: string, email: string, roleName: string, loginUrl: string): string => {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bienvenue sur SIGIE</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

        <!-- EN-TÊTE -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a3c5e 0%,#2563a8 100%);padding:32px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#a8c7f0;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Système Intégré de Gestion</p>
            <h1 style="margin:0;font-size:26px;font-weight:700;color:#fff;">SIGIE</h1>
          </td>
        </tr>

        <!-- CORPS -->
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 12px;font-size:21px;font-weight:700;color:#1a2f4a;">Bienvenue, ${fullName} 👋</h2>
            <p style="margin:0 0 24px;font-size:15px;color:#4a5568;line-height:1.7;">
              Votre compte <strong>${roleName}</strong> est maintenant <strong style="color:#16a34a;">actif</strong>.
              Vous pouvez vous connecter avec votre adresse email et le mot de passe temporaire qui vous a été fourni.
            </p>

            <!-- INFOS -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7faff;border:1px solid #dce8f8;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:20px 24px;">
                  <table width="100%" cellpadding="5" cellspacing="0">
                    <tr>
                      <td style="font-size:13px;color:#718096;width:130px;">Adresse e-mail</td>
                      <td style="font-size:14px;font-weight:600;color:#1a2f4a;">${email}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#718096;">Rôle assigné</td>
                      <td style="font-size:14px;font-weight:600;color:#1a2f4a;">${roleName}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- ALERTE VERTE -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:0 6px 6px 0;margin-bottom:28px;">
              <tr>
                <td style="padding:12px 16px;">
                  <p style="margin:0;font-size:13px;color:#15803d;">
                    ✅ <strong>Compte activé.</strong> Pensez à changer votre mot de passe dès la première connexion.
                  </p>
                </td>
              </tr>
            </table>

            <!-- BOUTON -->
            <div style="text-align:center;">
              <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#1a3c5e 0%,#2563a8 100%);color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:8px;">
                Se connecter à SIGIE →
              </a>
            </div>
          </td>
        </tr>

        <!-- PIED DE PAGE -->
        <tr>
          <td style="background:#f7faff;border-top:1px solid #e2eaf4;padding:18px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#a0aec0;">© SIGIE — En cas de problème, contactez votre administrateur.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();
};
