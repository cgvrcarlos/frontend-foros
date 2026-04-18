'use client';

export type Filter = 'todos' | 'proximos' | 'pasados';

interface EventFilterTabsProps {
  value: Filter;
  onChange: (v: Filter) => void;
}

const TABS: { id: Filter; label: string }[] = [
  { id: 'proximos', label: 'Próximos' },
  { id: 'pasados', label: 'Pasados' },
  { id: 'todos', label: 'Todos' },
];

export function EventFilterTabs({ value, onChange }: EventFilterTabsProps) {
  return (
    <div className="flex gap-1 bg-bg-light rounded-lg p-1 w-fit">
      {TABS.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={value === tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            value === tab.id ? 'bg-teal-accent text-white' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
