import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  to?:   string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Separator = () => (
  <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden>
    <path d="M4.5 2l3.5 4-3.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Fil d'Ariane">
      <ol className="flex items-center gap-1.5 m-0 p-0 list-none">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <span className="text-gray-400 shrink-0">
                  <Separator />
                </span>
              )}
              {isLast || !item.to ? (
                <span
                  className="text-sm font-medium text-gray-900 whitespace-nowrap"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="text-sm text-gray-500 hover:text-benin-green transition-colors whitespace-nowrap">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
