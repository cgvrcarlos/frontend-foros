'use client';

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Buscar...' }: SearchInputProps) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 pl-10 rounded-lg border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal-accent focus:border-transparent transition"
      />
    </div>
  );
}
