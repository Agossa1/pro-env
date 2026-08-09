import type { ReactNode } from 'react';

interface TopbarProps {
  breadcrumb?: ReactNode;
  actions?:    ReactNode;
}

function Topbar({ breadcrumb, actions }: TopbarProps) {
  return (
    <header className="fixed top-0 left-[260px]  right-0 z-40 bg-white shadow-sm" role="banner">
      {/* Drapeau du Bénin — bande tricolore sur toute la largeur */}
      <div className="flex h-[4px]" aria-hidden>
        <div className="flex-1 bg-benin-green" />
        <div className="flex-1 bg-benin-yellow" />
        <div className="flex-1 bg-benin-red" />
      </div>

      <div className="flex items-center px-8 h-14 gap-4">
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {breadcrumb}
        </div>
        {actions && (
          <div className="flex items-center gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

export default Topbar;
