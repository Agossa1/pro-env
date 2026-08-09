export interface TabItem {
  key:    string;
  label:  string;
  badge?: number | string;
}

interface TabsProps {
  items:    TabItem[];
  active:   string;
  onChange: (key: string) => void;
}

function Tabs({ items, active, onChange }: TabsProps) {
  return (
    <div className="flex border-b border-gray-200" role="tablist">
      {items.map((item) => {
        const isActive = active === item.key;
        return (
          <button
            key={item.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.key)}
            className={`flex items-center gap-2 px-5 py-3 text-base font-medium border-b-2 -mb-[1px] transition-colors whitespace-nowrap ${
              isActive
                ? 'text-benin-green border-benin-green'
                : 'text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300'
            }`}
            type="button"
          >
            {item.label}
            {item.badge !== undefined && (
              <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full ${
                isActive
                  ? 'bg-benin-green/15 text-benin-green'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
