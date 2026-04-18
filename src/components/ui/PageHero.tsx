interface PageHeroProps {
  title: string;
  subtitle?: string;
  backgroundVariant?: 'teal-dark' | 'teal-mid';
  children?: React.ReactNode;
}

export function PageHero({ title, subtitle, backgroundVariant = 'teal-dark', children }: PageHeroProps) {
  return (
    <section className={`relative overflow-hidden text-white px-4 py-14 md:py-20 ${backgroundVariant === 'teal-mid' ? 'bg-teal-mid' : 'bg-teal-dark'}`}>
      <div className="relative max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-3 text-teal-soft text-base md:text-lg max-w-2xl">{subtitle}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
