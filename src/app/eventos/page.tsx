'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import type { Evento } from '@/types/api';

function EventoCard({ evento }: { evento: Evento }) {
  const fecha = new Date(evento.fechaHora);
  const fechaFormateada = fecha.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const hora = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  const esVirtual = !!evento.linkVirtual;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900 leading-snug">{evento.titulo}</h2>
        <span
          className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${
            esVirtual
              ? 'bg-violet-50 text-violet-600 border border-violet-100'
              : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
          }`}
        >
          {esVirtual ? 'Virtual' : 'Presencial'}
        </span>
      </div>

      {evento.descripcion && (
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{evento.descripcion}</p>
      )}

      <div className="flex flex-col gap-1.5 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="capitalize">{fechaFormateada} — {hora}</span>
        </div>
        {evento.ubicacionPresencial && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{evento.ubicacionPresencial}</span>
          </div>
        )}
      </div>

      <div className="mt-auto pt-2">
        <Link
          href={`/eventos/${evento.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-500 hover:text-blue-700 transition-colors"
        >
          Ver más
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-pulse">
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

  useEffect(() => {
    api.get<Evento[]>('/eventos')
      .then(res => setEventos(res.data))
      .catch(() => setError('No se pudieron cargar los eventos. Intentá de nuevo más tarde.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Eventos</h1>
        <p className="text-slate-500">Todos los eventos ciudadanos disponibles.</p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : eventos.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium">No hay eventos disponibles por el momento.</p>
          <p className="text-sm text-slate-400 mt-1">Volvé pronto para ver nuevos eventos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventos.map(ev => <EventoCard key={ev.id} evento={ev} />)}
        </div>
      )}
    </div>
  );
}
