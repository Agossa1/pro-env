import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';

export interface NavItem {
  label:    string;
  to:       string;
  icon?:    ReactNode;
  section?: string;
  roles?:   string[];
}

interface SidebarProps {
  items:     NavItem[];
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 15 15" fill="none" aria-hidden>
    <path d="M6 2H2.5A.5.5 0 0 0 2 2.5v10a.5.5 0 0 0 .5.5H6M10 10.5l3-3-3-3M13 7.5H5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Sidebar({ items, userName, userRole, onLogout }: SidebarProps) {
  const sections = items.reduce<{ title: string | null; items: NavItem[] }[]>((acc, item) => {
    const sectionTitle = item.section ?? null;
    const last = acc[acc.length - 1];
    if (!last || last.title !== sectionTitle) {
      acc.push({ title: sectionTitle, items: [item] });
    } else {
      last.items.push(item);
    }
    return acc;
  }, []);

  const initials = userName ? userName.split(' ').map((w) => w[0]).slice(0, 2).join('') : '–';

  return (
    <aside className="w-[260px] min-h-screen bg-gray-900 flex flex-col fixed top-0 left-0 bottom-0 z-50 shrink-0" aria-label="Navigation principale">
      <div className="px-5 pt-6 pb-5 border-b border-white/10 shrink-0">
        <div className="text-2xl font-bold text-white tracking-wide leading-tight">SIGIE</div>
        <div className="text-lg text-gray-400 mt-1 tracking-wide">République du Bénin</div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {sections.map((section, i) => (
          <div key={i} className="mb-4 last:mb-0">
            {section.title && (
              <div className="text-xm font-normal text-gray-500 tracking-wide px-5 pb-2">
                {section.title}
              </div>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-2.5 text-lg transition-colors border-l-2 ${
                    isActive
                      ? 'text-white bg-benin-green/20 border-benin-green font-medium'
                      : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {item.icon && (
                  <span className={`shrink-0 ${true /* isActive ? 'opacity-100' : 'opacity-70' - géré par le groupe ou manuellement */} opacity-80`} aria-hidden>
                    {item.icon}
                  </span>
                )}
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {(userName || onLogout) && (
        <div className="px-5 py-4 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-benin-green flex items-center justify-center text-sm font-bold text-white shrink-0">
              {initials}
            </div>
            {userName && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{userName}</div>
                {userRole && <div className="text-xs text-gray-400 truncate">{userRole}</div>}
              </div>
            )}
            {onLogout && (
              <button
                className="p-1.5 text-gray-500 hover:text-benin-red transition-colors shrink-0 rounded"
                onClick={onLogout}
                aria-label="Se déconnecter"
                type="button"
              >
                <LogoutIcon />
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
