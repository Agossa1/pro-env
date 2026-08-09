import { useRef, useState, useEffect, type ReactNode } from 'react';

export interface MenuItem {
  label:     string;
  onClick?:  () => void;
  href?:     string;
  danger?:   boolean;
  separator?: boolean;
}

interface MenuProps {
  trigger:  ReactNode;
  items:    MenuItem[];
}

function Menu({ trigger, items }: MenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  return (
    <div className="relative inline-flex" ref={wrapperRef}>
      <div onClick={() => setOpen((v) => !v)} aria-expanded={open} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <div className="absolute top-[calc(100%+8px)] right-0 min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg py-1.5 z-[200]" role="menu">
          {items.map((item, i) => (
            <div key={i}>
              {item.separator && <div className="h-px bg-gray-200 my-1.5" role="separator" />}
              {item.href ? (
                <a
                  href={item.href}
                  className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    item.danger
                      ? 'text-benin-red hover:bg-benin-red/10'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              ) : (
                <button
                  type="button"
                  className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    item.danger
                      ? 'text-benin-red hover:bg-benin-red/10'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  role="menuitem"
                  onClick={() => { item.onClick?.(); setOpen(false); }}
                >
                  {item.label}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Menu;
