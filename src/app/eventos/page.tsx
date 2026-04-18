'use client';
import { useState, useEffect, useMemo } from 'react';
import { PageHero } from '@/components/ui/PageHero';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { EventFilterTabs, type Filter } from '@/components/ui/EventFilterTabs';
import { SearchInput } from '@/components/ui/SearchInput';
import api from '@/lib/api';
import type { Evento } from '@/types/api';

function SkeletonCard() {
  return (
    <div className="bg-surface rounded-xl border border-border shadow-sm p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="h-5 bg-slate-200 rounded w-3/4" />
        <div className="h-5 bg-slate-200 rounded-full w-16" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-5/6" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 rounded w-1/2" />
        <div className="h-3 bg-slate-200 rounded w-2/5" />
      </div>
    </div>
  );
}

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('todos');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api
      .get<{ data: Evento[] } | Evento[]>('/eventos')
      .then(res => {
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : (raw as { data: Evento[] }).data ?? [];
        setEventos(list);
      })
      .catch(() => setError('No se pudieron cargar los eventos. Intente nuevamente.'))
      .finally(() => setLoading(false));
  }, []);

  // debounce search
  useEffect(() => {
    const h = setTimeout(() => setSearch(searchInput), 200);
    return () => clearTimeout(h);
  }, [searchInput]);

  const filtered = useMemo(() => {
    const now = Date.now();
    const needle = search.trim().toLowerCase();
    return eventos.filter(ev => {
      const ts = new Date(ev.fechaHora).getTime();
      const matchesFilter =
        filter === 'todos' ? true : filter === 'proximos' ? ts >= now : ts < now;
      const matchesSearch = !needle || ev.titulo.toLowerCase().includes(needle);
      return matchesFilter && matchesSearch;
    });
  }, [eventos, filter, search]);

  return (
    <>
      <PageHero title="Eventos" subtitle="Todos los eventos ciudadanos disponibles." />

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <EventFilterTabs value={filter} onChange={setFilter} />
          <div className="sm:ml-auto w-full sm:w-72">
            <SearchInput
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Buscar evento..."
            />
          </div>
        </div>

        {error ? (
          <div className="text-center py-20">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : eventos.length === 0 ? (
          <div className="text-center py-20">
            <svg
              className="w-12 h-12 mx-auto text-text-muted/40 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-text-primary font-medium">No hay eventos disponibles por el momento.</p>
            <p className="text-text-muted text-sm mt-1">Vuelva pronto para ver nuevos eventos.</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-10 text-text-muted">
            No se encontraron eventos con ese criterio.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(ev => {
              const fecha = new Date(ev.fechaHora);
              const isUpcoming = fecha >= new Date();
              const fechaFormateada = fecha.toLocaleDateString('es-MX', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <SectionCard key={ev.id} variant="elevated">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-base font-semibold text-text-primary leading-snug">
                        {ev.titulo}
                      </h2>
                      <StatusBadge status={isUpcoming ? 'upcoming' : 'past'} />
                    </div>

                    <p className="text-sm text-text-muted">{fechaFormateada}</p>

                    <div className="flex gap-2 flex-wrap">
                      {ev.ubicacionPresencial && <StatusBadge status="presencial" />}
                      {ev.linkVirtual && !ev.ubicacionPresencial && <StatusBadge status="virtual" />}
                    </div>

                    <div className="mt-auto pt-2">
                      <SecondaryButton href={`/eventos/${ev.id}`} size="sm">
                        Ver detalle
                      </SecondaryButton>
                    </div>
                  </div>
                </SectionCard>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
