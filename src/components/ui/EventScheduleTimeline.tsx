import type { Ponencia } from '@/types/api';

interface EventScheduleTimelineProps {
  ponencias: Ponencia[];
}

export function EventScheduleTimeline({ ponencias }: EventScheduleTimelineProps) {
  const sorted = [...ponencias].sort((a, b) =>
    a.orden !== b.orden ? a.orden - b.orden : a.horaInicio.localeCompare(b.horaInicio)
  );

  if (sorted.length === 0) {
    return (
      <div className="text-center py-10">
        <svg className="w-10 h-10 mx-auto text-text-muted/40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-text-muted font-medium">Aún no hay ponencias confirmadas para este evento.</p>
      </div>
    );
  }

  return (
    <ol className="relative">
      <span className="hidden md:block absolute left-[92px] top-0 bottom-0 w-0.5 bg-teal-accent/30" aria-hidden />
      {sorted.map(p => (
        <li key={p.id} className="flex flex-col md:flex-row gap-2 md:gap-6 pb-8 last:pb-0 relative">
          <div className="w-20 shrink-0 pt-1 font-mono text-sm text-text-muted md:text-right">
            {p.horaInicio}<span className="hidden md:inline"><br/>–<br/></span><span className="md:hidden"> – </span>{p.horaFin}
          </div>
          <span className="hidden md:block absolute left-[86px] top-2 w-3 h-3 rounded-full bg-teal-accent ring-4 ring-bg-light" aria-hidden />
          <div className="flex-1 bg-surface border border-border border-l-4 border-l-teal-accent rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-text-primary">{p.ponente.nombre}</h3>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-text-muted">
              <svg className="w-3.5 h-3.5 text-teal-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {p.lugar}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
