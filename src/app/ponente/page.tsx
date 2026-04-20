'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { PageHero } from '@/components/ui/PageHero';
import { SectionCard } from '@/components/ui/SectionCard';
import api from '@/lib/api';

interface MiPonencia {
  id: string;
  titulo: string;
  descripcion?: string | null;
  lugar: string;
  horaInicio: string;
  horaFin: string;
  evento: {
    id: string;
    titulo: string;
    fechaHora: string;
    survey?: { id: string } | null;
  };
}

interface MisPonenciasResponse {
  id: string;
  nombre: string;
  email: string;
  bio?: string | null;
  ponencias: MiPonencia[];
}

function PonenciaCard({ ponencia }: { ponencia: MiPonencia }) {
  const fecha = new Date(ponencia.evento.fechaHora);
  const fechaFormateada = fecha.toLocaleDateString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <SectionCard>
      <div className="mb-3">
        <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Evento</p>
        <h3 className="font-semibold text-text-primary">{ponencia.evento.titulo}</h3>
        <p className="text-sm text-text-muted capitalize mt-0.5">{fechaFormateada}</p>
      </div>

      <div className="border-t border-border pt-4 mt-4">
        <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Ponencia</p>
        <h4 className="font-medium text-text-primary mb-1">{ponencia.lugar}</h4>
        <p className="text-xs text-text-muted font-mono">
          {ponencia.horaInicio} — {ponencia.horaFin}
        </p>
      </div>

      {ponencia.evento.survey?.id && (
        <div className="mt-4 pt-4 border-t border-border">
          <Link
            href={`/surveys/${ponencia.evento.survey.id}/respuestas`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-accent hover:opacity-80 transition-opacity"
          >
            Ver respuestas de encuesta
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </SectionCard>
  );
}

export default function PonentePanel() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [ponencias, setPonencias] = useState<MiPonencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !user.roles?.includes('PONENTE'))) {
      router.replace('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user?.roles?.includes('PONENTE')) return;

    api.get<MisPonenciasResponse>('/ponentes/mis-ponencias')
      .then(res => setPonencias(res.data.ponencias))
      .catch(() => setError('No se pudieron cargar tus ponencias.'))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-teal-dark">
        <p className="text-white/60">Verificando permisos...</p>
      </div>
    );
  }

  if (!user || !user.roles?.includes('PONENTE')) return null;

  return (
    <>
      <PageHero
        title="Panel del Ponente"
        subtitle={`Bienvenido, ${user.nombres}. Estas son tus ponencias asignadas.`}
      />

      <div className="max-w-4xl mx-auto px-4 py-10">
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface rounded-xl border border-border p-6 animate-pulse">
                <div className="h-3 bg-slate-200 rounded w-1/3 mb-3" />
                <div className="h-5 bg-slate-200 rounded w-4/5 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-2/5" />
              </div>
            ))}
          </div>
        ) : ponencias.length === 0 ? (
          <SectionCard>
            <div className="text-center py-10">
              <p className="text-text-primary font-medium">No tiene ponencias asignadas.</p>
              <p className="text-text-muted text-sm mt-1">
                El administrador le asignará eventos próximamente.
              </p>
            </div>
          </SectionCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ponencias.map(p => (
              <PonenciaCard key={p.id} ponencia={p} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
