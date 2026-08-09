import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyAccount } from '../services/auth.api';

function ActivateForm({ email: emailFromUrl }: { email?: string }) {
  const navigate = useNavigate();

  const [email, setEmail]                     = useState(emailFromUrl ?? '');
  const [digits, setDigits]                   = useState(['', '', '', '', '', '']);
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [error, setError]                     = useState<string | null>(null);
  const [success, setSuccess]                 = useState(false);
  const [showPass, setShowPass]               = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // OTP input handling
  const handleDigit = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const otpCode = digits.join('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (otpCode.length < 6) { setError('Veuillez saisir les 6 chiffres du code.'); return; }
    if (password !== confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return; }
    setIsSubmitting(true);
    try {
      await verifyAccount({ email, code: otpCode, password, confirmPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message ?? "Échec de l'activation du compte.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Succès ───────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Compte activé</h2>
          <p className="text-sm text-gray-500 mb-8">
            Votre compte est actif. Vous pouvez maintenant vous connecter.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  // ── Formulaire ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-gray-900">Activation du compte</h1>
          <p className="text-sm text-gray-500 mt-1">
            Saisissez le code reçu par email et créez votre mot de passe.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <form onSubmit={handleSubmit} className="p-8 space-y-5">

            {/* Erreur */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            {/* Email */}
            <div>
              <label htmlFor="activate-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Adresse email
              </label>
              <input
                id="activate-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@benin.gouv.bj"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Code OTP — boîtes individuelles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Code de vérification (6 chiffres)
              </label>
              <div className="flex gap-2 justify-between" onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleDigit(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`w-full aspect-square text-center text-xl font-bold rounded-xl border-2 transition-colors focus:outline-none ${
                      d
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 text-gray-900'
                    } focus:border-emerald-500`}
                  />
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Mot de passe */}
            <div>
              <label htmlFor="activate-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  id="activate-password"
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8 caractères minimum"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs select-none">
                  {showPass ? 'Masquer' : 'Voir'}
                </button>
              </div>
            </div>

            {/* Confirmation */}
            <div>
              <label htmlFor="activate-confirm" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  id="activate-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez le mot de passe"
                  className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                    confirmPassword && confirmPassword !== password
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400'
                      : 'border-gray-200 focus:ring-emerald-500/30 focus:border-emerald-500'
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs select-none">
                  {showConfirm ? 'Masquer' : 'Voir'}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-xs text-red-500 mt-1.5">Les mots de passe ne correspondent pas.</p>
              )}
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={isSubmitting || otpCode.length < 6}
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Activation en cours…' : 'Activer mon compte'}
            </button>

          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          Problème avec le code ? Contactez votre administrateur.
        </p>
      </div>
    </div>
  );
}

export default ActivateForm;