import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { selectIsAuthenticated, selectIsInitialized } from '../../features/auth/services/auth.selectors';

/**
 * Protège toutes les routes enfants.
 * - Si l'app n'est pas encore initialisée → écran de chargement
 * - Si non authentifié → redirection vers /login
 * - Sinon → rendu des routes enfants
 */
function ProtectedRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitialized   = useSelector(selectIsInitialized);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-benin-green border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
