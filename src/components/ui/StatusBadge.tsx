type BadgeStatus = 'upcoming' | 'past' | 'live' | 'published' | 'draft' | 'virtual' | 'presencial';

const STYLES: Record<BadgeStatus, { bg: string; text: string; label: string }> = {
  upcoming:   { bg: 'bg-teal-accent',  text: 'text-white',        label: 'Próximo' },
  past:       { bg: 'bg-slate-400',    text: 'text-white',        label: 'Pasado' },
  live:       { bg: 'bg-orange-cta',   text: 'text-white',        label: 'En vivo' },
  published:  { bg: 'bg-teal-accent',  text: 'text-white',        label: 'Publicado' },
  draft:      { bg: 'bg-border',       text: 'text-text-muted',   label: 'Borrador' },
  virtual:    { bg: 'bg-violet-50',    text: 'text-violet-600',   label: 'Virtual' },
  presencial: { bg: 'bg-emerald-50',   text: 'text-emerald-600',  label: 'Presencial' },
};

export function StatusBadge({ status }: { status: BadgeStatus }) {
  const s = STYLES[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}
