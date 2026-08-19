import { useState } from 'react';
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

const BriefcaseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ToolIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BuildingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1M9 13h1m4 0h1M9 17h1m4 0h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TeamsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NAV_ITEMS: NavItem[] = [
  { label: 'Tableau de bord', to: '/dashboard',    icon: <HomeIcon />,      section: 'Principal' },
  { label: 'Signalements',    to: '/reports',      icon: <AlertIcon />,     section: 'Terrain', roles: ['super_admin', 'admin_ministere', 'admin_mairie', 'prefecture', 'technicien', 'citoyen'] },
  { label: 'Missions',        to: '/missions',     icon: <BriefcaseIcon />, section: 'Terrain', roles: ['super_admin', 'admin_ministere', 'admin_mairie', 'prefecture', 'technicien'] },
  { label: 'Interventions',   to: '/interventions',icon: <ToolIcon />,      section: 'Terrain' },
  { label: 'Structures',      to: '/structures',   icon: <BuildingsIcon />, section: 'Terrain' },
  { label: 'Sociétés',        to: '/societes',     icon: <BriefcaseIcon />, section: 'Terrain', roles: ['super_admin', 'admin_ministere', 'admin_mairie', 'prefecture'] },
  { label: 'Équipes',          to: '/teams',        icon: <TeamsIcon />,    section: 'Terrain' },
  { label: 'Utilisateurs',    to: '/users',        icon: <UsersIcon />,     section: 'Administration', roles: ['super_admin', 'admin_ministere', 'admin_mairie', 'prefecture'] },
  { label: 'Rôles',           to: '/roles',        icon: <ShieldIcon />,    section: 'Administration', roles: ['super_admin'] },
  { label: 'Permissions',     to: '/permissions',  icon: <KeyIcon />,       section: 'Administration', roles: ['super_admin'] },
  { label: 'Territoires',     to: '/territories',  icon: <MapPinIcon />,    section: 'Administration', roles: ['super_admin', 'admin_ministere'] },
];

/**
 * Layout principal de l'application — responsive avec sidebar drawer sur mobile.
 */
function AppLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login');
    }
  };

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    if (!user || !user.role) return false;
    if (item.to === '/users' && user.role.canManageUsers) return true;
    return item.roles.includes(user.role.code);
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar — desktop fixed / mobile drawer */}
      <Sidebar
        items={filteredNavItems}
        userName={user?.fullName ?? 'Utilisateur'}
        userRole={user?.role?.name ?? user?.role?.code ?? '—'}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Topbar */}
      <Topbar onMenuToggle={() => setSidebarOpen(prev => !prev)} />

      {/* Main content — offset for desktop sidebar */}
      <main className="flex-1 flex flex-col min-h-screen pt-[58px] lg:ml-[260px] max-w-full overflow-x-hidden w-full">
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AppLayout;
