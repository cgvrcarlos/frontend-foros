'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';
import type { Evento } from '@/types/api';

function SkeletonDetalle() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-3/4 mb-3" />
      <div className="h-4 bg-slate-200 rounded w-1/3 mb-8" />
      <div className="space-y-3">
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-4 bg-slate-200 rounded w-5/6" />
        <div className="h-4 bg-slate-200 rounded w-4/6" />
      </div>
    </div>
  );
}

export default function EventoDetallePage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!params.id) return;
    api.get<Evento>(`/eventos/${params.id}`)
      .then(res => setEvento(res.data))
      .catch(() => setError('No se pudo cargar el evento.'))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <SkeletonDetalle />
      </div>
    );
  }

  if (error || !evento) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
          {error || 'Evento no encontrado.'}
        </div>
        <Link href="/eventos" className="mt-4 inline-block text-sm text-blue-500 hover:underline">
          Volver a eventos
        </Link>
      </div>
    );
  }

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
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/eventos" className="hover:text-slate-700 transition-colors">Eventos</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-900 font-medium truncate">{evento.titulo}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">{evento.titulo}</h1>
          <span
            className={`shrink-0 px-3 py-1 rounded-full text-sm font-medium ${
              esVirtual
                ? 'bg-violet-50 text-violet-600 border border-violet-100'
                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
            }`}
          >
            {esVirtual ? 'Virtual' : 'Presencial'}
          </span>
        </div>

        {evento.descripcion && (
          <p className="text-slate-600 leading-relaxed mb-6">{evento.descripcion}</p>
        )}

        <div className="flex flex-col gap-3 text-sm text-slate-600 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="capitalize">{fechaFormateada} — {hora}</span>
          </div>

          {evento.ubicacionPresencial && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span>{evento.ubicacionPresencial}</span>
            </div>
          )}

          {evento.linkVirtual && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <a href={evento.linkVirtual} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {evento.linkVirtual}
              </a>
            </div>
          )}
        </div>

        {/* CTA Asistencia */}
        <div className="pt-6">
          {user ? (
            <Link
              href={`/eventos/${evento.id}/confirmar`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
            >
              Confirmar asistencia
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <p className="text-sm text-slate-500">Para confirmar tu asistencia necesitás registrarte.</p>
              <Link
                href="/auth/register"
                className="shrink-0 px-5 py-2.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Ponencias / Itinerario */}
      {evento.ponencias && evento.ponencias.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-5">Itinerario</h2>
          <div className="space-y-4">
            {evento.ponencias.map((p) => (
              <div key={p.id} className="flex gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="shrink-0 text-xs font-mono text-slate-400 pt-0.5 w-24">
                  {p.horaInicio} — {p.horaFin}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900 mb-0.5">{p.lugar}</h3>
                  <p className="text-xs text-slate-400">Ponente: {p.ponente.nombre}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
