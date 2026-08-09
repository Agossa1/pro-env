import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar, Topbar, type NavItem } from '../navigations';
import { useAuth } from '../../features/auth/hooks/useAuth';

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const KeyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const NAV_ITEMS: NavItem[] = [
  { label: 'Tableau de bord', to: '/dashboard',  icon: <HomeIcon />,   section: 'Principal' },
  { label: 'Signalements',    to: '/reports',     icon: <AlertIcon />,  section: 'Terrain' },
  { label: 'Utilisateurs',    to: '/users',       icon: <UsersIcon />,  section: 'Administration', roles: ['super_admin', 'admin_ministere', 'admin_mairie', 'prefecture'] },
  { label: 'Rôles',           to: '/roles',       icon: <ShieldIcon />, section: 'Administration', roles: ['super_admin'] },
  { label: 'Permissions',     to: '/permissions', icon: <KeyIcon />,    section: 'Administration', roles: ['super_admin'] },
  { label: 'Territoires',     to: '/territories', icon: <MapPinIcon />, section: 'Administration', roles: ['super_admin', 'admin_ministere'] },
];

/**
 * Layout principal de l'application (Sidebar + Topbar + Contenu).
 * Enveloppe les routes privées via `<Outlet />`.
 */
function AppLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login');
    }
  };

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    // Si l'élément n'a pas de restriction de rôle, il est visible par tous
    if (!item.roles) return true;
    if (!user || !user.role) return false;
    
    // Exception pour Utilisateurs : on check aussi la permission canManageUsers
    if (item.to === '/users' && user.role.canManageUsers) return true;

    return item.roles.includes(user.role.code);
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        items={filteredNavItems}
        userName={user?.fullName ?? 'Utilisateur'}
        userRole={user?.role?.name ?? user?.role?.code ?? '—'}
        onLogout={handleLogout}
      />
      
      <Topbar />

      <main className="ml-[260px] pt-16 flex-1 flex flex-col min-h-screen">
        <div className="p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AppLayout;
