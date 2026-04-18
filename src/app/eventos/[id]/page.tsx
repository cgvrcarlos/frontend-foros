'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';
import { PageHero } from '@/components/ui/PageHero';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { EventScheduleTimeline } from '@/components/ui/EventScheduleTimeline';
import type { Evento } from '@/types/api';

function SkeletonDetalle() {
  return (
    <div className="animate-pulse max-w-3xl mx-auto px-4 py-10">
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
    api
      .get<Evento>(`/eventos/${params.id}`)
      .then(res => setEvento(res.data))
      .catch(() => setError('No se pudo cargar el evento.'))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <SkeletonDetalle />;

  if (error || !evento) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
          {error || 'Evento no encontrado.'}
        </div>
        <Link href="/eventos" className="mt-4 inline-block text-sm text-teal-accent hover:underline">
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
  const isUpcoming = fecha >= new Date();

  return (
    <>
      <PageHero title={evento.titulo}>
        <div className="flex flex-wrap items-center gap-3 text-teal-soft text-sm">
          <span className="capitalize">{fechaFormateada} — {hora}</span>
          <StatusBadge status={isUpcoming ? 'upcoming' : 'past'} />
          {evento.ubicacionPresencial && <StatusBadge status="presencial" />}
          {evento.linkVirtual && !evento.ubicacionPresencial && <StatusBadge status="virtual" />}
        </div>
      </PageHero>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-muted">
          <Link href="/eventos" className="hover:text-text-primary transition-colors">Eventos</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-text-primary font-medium truncate">{evento.titulo}</span>
        </nav>

        {/* Location / Virtual link */}
        {(evento.ubicacionPresencial || evento.linkVirtual) && (
          <SectionCard>
            <div className="flex flex-col gap-3 text-sm text-text-muted">
              {evento.ubicacionPresencial && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-bg-light border border-border flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-teal-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span>{evento.ubicacionPresencial}</span>
                </div>
              )}
              {evento.linkVirtual && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-bg-light border border-border flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-teal-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <a
                    href={evento.linkVirtual}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-accent hover:underline"
                  >
                    {evento.linkVirtual}
                  </a>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* Description */}
        {evento.descripcion && (
          <SectionCard title="Descripción">
            <p className="text-text-muted leading-relaxed">{evento.descripcion}</p>
          </SectionCard>
        )}

        {/* Schedule */}
        <SectionCard title="Programa">
          <EventScheduleTimeline ponencias={evento.ponencias ?? []} />
        </SectionCard>

        {/* Attendance CTA */}
        <SectionCard>
          {user ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <p className="text-text-muted text-sm">¿Desea confirmar su asistencia a este evento?</p>
              <PrimaryButton href={`/eventos/${evento.id}/confirmar`}>
                Confirmar asistencia
              </PrimaryButton>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <p className="text-text-muted text-sm">
                Para confirmar su asistencia necesita registrarse.
              </p>
              <PrimaryButton href="/auth/register">Regístrese</PrimaryButton>
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}
