import type { ReactNode } from 'react';

interface TopbarProps {
  breadcrumb?: ReactNode;
  actions?:    ReactNode;
  onMenuToggle?: () => void;
}

const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Topbar({ breadcrumb, actions, onMenuToggle }: TopbarProps) {
  return (
    <header
      className="fixed top-0 right-0 left-0 lg:left-[260px] z-40 bg-white shadow-sm"
      role="banner"
    >
      {/* Bande tricolore Bénin */}
      <div className="flex h-[4px]" aria-hidden>
        <div className="flex-1 bg-benin-green" />
        <div className="flex-1 bg-benin-yellow" />
        <div className="flex-1 bg-benin-red" />
      </div>

      <div className="flex items-center px-4 sm:px-6 lg:px-8 h-14 gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Ouvrir le menu"
          type="button"
        >
          <HamburgerIcon />
        </button>

        {/* Logo mobile (visible quand sidebar cachée) */}
        <span className="lg:hidden text-base font-bold text-gray-800 tracking-wide mr-auto">
          SIGIE
        </span>

        <div className="hidden lg:flex flex-1 items-center gap-2 min-w-0">
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
