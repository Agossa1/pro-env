import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { selectAuthUser } from '../../features/auth/services/auth.selectors';

/**
 * Protège les routes réservées au super admin.
 * - Si l'utilisateur connecté n'est pas super_admin → redirection vers /dashboard
 */
function SuperAdminRoute() {
  const user = useSelector(selectAuthUser);
  const roleCode = user?.role?.code ?? '';

  if (roleCode !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default SuperAdminRoute;