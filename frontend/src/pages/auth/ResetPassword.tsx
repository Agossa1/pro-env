import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch } from '../../hooks/useRedux';
import { resetPasswordThunk } from '../../features/auth/services/auth.thunk';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Mail, KeyRound, Loader2, ArrowRight } from 'lucide-react';

const resetPasswordSchema = z.object({
  email: z.string().email("L'adresse email est invalide"),
  code: z.string().length(6, "Le code doit contenir exactement 6 chiffres").regex(/^\d+$/, "Chiffres uniquement"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string().min(8, "La confirmation est requise"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: emailParam,
    }
  });

  useEffect(() => {
    if (emailParam) {
      setValue('email', emailParam);
    }
  }, [emailParam, setValue]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      await dispatch(resetPasswordThunk(data)).unwrap();
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      setErrorMessage(error || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          SIGIE
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-400">
          Système d'Information et de Gestion Interactive de l'Environnement
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-neutral-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-neutral-700">
          {isSuccess ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500/10">
                <Lock className="h-6 w-6 text-emerald-500" aria-hidden="true" />
              </div>
              <h3 className="mt-2 text-lg font-medium text-white">Mot de passe réinitialisé</h3>
              <p className="mt-1 text-sm text-neutral-400">
                Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la page de connexion...
              </p>
              <div className="mt-6">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-neutral-900 transition-colors"
                >
                  Se connecter
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white">Nouveau mot de passe</h3>
                <p className="mt-1 text-sm text-neutral-400">
                  Veuillez entrer le code à 6 chiffres reçu par email et définir un nouveau mot de passe.
                </p>
              </div>

              {errorMessage && (
                <div className="rounded-md bg-red-500/10 p-4 mb-6 border border-red-500/20">
                  <div className="text-sm text-red-500">{errorMessage}</div>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-300">
                    Adresse email
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-neutral-500" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      readOnly={!!emailParam}
                      className={`block w-full pl-10 bg-neutral-900 border ${
                        errors.email ? 'border-red-500' : 'border-neutral-700'
                      } rounded-md py-2 text-white shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm ${
                        emailParam ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-neutral-300">
                    Code de vérification (6 chiffres)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-neutral-500" />
                    </div>
                    <input
                      id="code"
                      type="text"
                      maxLength={6}
                      className={`block w-full pl-10 bg-neutral-900 border ${
                        errors.code ? 'border-red-500' : 'border-neutral-700'
                      } rounded-md py-2 text-white shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-center tracking-widest font-mono text-lg`}
                      placeholder="------"
                      {...register('code')}
                    />
                  </div>
                  {errors.code && (
                    <p className="mt-2 text-sm text-red-500">{errors.code.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-300">
                    Nouveau mot de passe
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-neutral-500" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      className={`block w-full pl-10 bg-neutral-900 border ${
                        errors.password ? 'border-red-500' : 'border-neutral-700'
                      } rounded-md py-2 text-white shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                      {...register('password')}
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-300">
                    Confirmer le mot de passe
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-neutral-500" />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      className={`block w-full pl-10 bg-neutral-900 border ${
                        errors.confirmPassword ? 'border-red-500' : 'border-neutral-700'
                      } rounded-md py-2 text-white shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                      {...register('confirmPassword')}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        Réinitialiser le mot de passe <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
