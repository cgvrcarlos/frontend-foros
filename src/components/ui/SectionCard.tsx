interface SectionCardProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'elevated';
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ title, description, variant = 'default', children, className = '' }: SectionCardProps) {
  return (
    <section className={`bg-surface border border-border rounded-xl p-6 md:p-8 ${variant === 'elevated' ? 'shadow-md' : 'shadow-sm'} ${className}`}>
      {title && <h2 className="text-lg md:text-xl font-semibold text-text-primary">{title}</h2>}
      {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      <div className={title || description ? 'mt-5' : ''}>{children}</div>
    </section>
  );
}
