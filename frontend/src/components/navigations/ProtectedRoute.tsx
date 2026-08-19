import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { selectIsAuthenticated, selectIsInitialized } from '../../features/auth/services/auth.selectors';
import GlobalLoader from './GlobalLoader';

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
    return <GlobalLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
