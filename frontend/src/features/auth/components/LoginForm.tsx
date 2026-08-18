import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
const EyeIcon = ({ open }: { open: boolean }) => open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
);

function Login() {
    const navigate = useNavigate();
    const { login, isLoading, error, clearError } = useAuth();

    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd]   = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        try {
            await login({ email, password });
            navigate('/');
        } catch {
            // error est déjà dans le store
        }
    };

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-4 relative"
            style={{
                backgroundImage: `url('/images/login-bg.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Overlay très léger pour garder l'image bien visible et lumineuse */}
            <div className="absolute inset-0 bg-black/20"></div>

            {/* Card */}
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden relative z-10 border border-gray-100">
                {/* Bande drapeau Bénin */}
                <div className="h-1.5 flex">
                    <div className="flex-1 bg-benin-green" />
                    <div className="flex-1 bg-benin-yellow" />
                    <div className="flex-1 bg-benin-red" />
                </div>

                <div className="p-8">
                    {/* En-tête */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-benin-green/10 mb-4 border border-benin-green/20 shadow-sm">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-benin-green">
                                <path d="M2 22h20"/>
                                <path d="M12 2l10 8H2L12 2z"/>
                                <path d="M6 10v8"/>
                                <path d="M10 10v8"/>
                                <path d="M14 10v8"/>
                                <path d="M18 10v8"/>
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
                        <p className="text-sm text-gray-500 mt-1">Plateforme  SIGIE — Bénin</p>
                    </div>

                    {/* Erreur globale */}
                    {error && (
                        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Adresse email
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="exemple@benin.gouv.bj"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-benin-green/40 focus:border-benin-green transition-colors"
                            />
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
                                    Mot de passe
                                </label>
                                <Link to="/forgot-password" className="text-xs text-benin-green hover:underline">
                                    Mot de passe oublié ?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPwd ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2.5 pr-11 rounded-lg border border-gray-300 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-benin-green/40 focus:border-benin-green transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwd((v) => !v)}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                                    aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                >
                                    <EyeIcon open={showPwd} />
                                </button>
                            </div>
                        </div>

                        {/* Bouton connexion */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 rounded-lg bg-benin-green text-white font-semibold text-sm hover:bg-benin-green/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-500">
                        Accès réservé aux membres autorisés.{' '}
                        <span className="font-medium text-gray-600">Contactez l'administrateur.</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;