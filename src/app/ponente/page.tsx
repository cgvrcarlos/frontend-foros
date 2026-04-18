'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/auth/AuthProvider';
import api from '@/lib/api';

interface MiPonencia {
  id: string;
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

function PonenciaCard({ ponencia }: { ponencia: MiPonencia }) {
  const fecha = new Date(ponencia.evento.fechaHora);
  const fechaFormateada = fecha.toLocaleDateString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="mb-3">
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Evento</p>
        <h3 className="font-semibold text-slate-900">{ponencia.evento.titulo}</h3>
        <p className="text-sm text-slate-500 capitalize mt-0.5">{fechaFormateada}</p>
      </div>

      <div className="border-t border-slate-100 pt-4 mt-4">
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Ponencia</p>
        <h4 className="font-medium text-slate-800 mb-1">{ponencia.lugar}</h4>
        <p className="text-xs text-slate-400 font-mono">
          {ponencia.horaInicio} — {ponencia.horaFin}
        </p>
      </div>

      {ponencia.evento.survey?.id && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <Link
            href={`/surveys/${ponencia.evento.survey.id}/respuestas`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-500 hover:text-blue-700 transition-colors"
          >
            Ver respuestas de encuesta
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function PonentePanel() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [ponencias, setPonencias] = useState<MiPonencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'PONENTE')) {
      router.replace('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role !== 'PONENTE') return;

    api.get<MiPonencia[]>('/ponentes/mis-ponencias')
      .then(res => setPonencias(res.data))
      .catch(() => setError('No se pudieron cargar tus ponencias.'))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading) {
    return (
      <div className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #063a3a 0%, #0a5252 55%, #1a2f5a 100%)' }}>
        <div className="text-white/60">Verificando permisos...</div>
      </div>
    );
  }

  if (!user || user.role !== 'PONENTE') return null;

  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-4rem)]"
      style={{ background: 'linear-gradient(135deg, #063a3a 0%, #0a5252 55%, #1a2f5a 100%)' }}>

      <div className="pointer-events-none absolute inset-0 select-none">
        <Image src="/papiro2.svg" alt="" width={320} height={320} className="absolute -left-16 top-1/4 opacity-[0.12] rotate-12" />
        <Image src="/papiro2.svg" alt="" width={280} height={280} className="absolute -right-12 bottom-1/4 opacity-[0.10] -rotate-12" />
        <Image src="/papiro3.svg" alt="" width={200} height={200} className="absolute left-1/4 -bottom-8 opacity-[0.08]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Mi panel</h1>
          <p className="text-white/70">
            Hola, {user.nombres}. Estas son tus ponencias asignadas.
          </p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                <div className="h-3 bg-slate-200 rounded w-1/3 mb-3" />
                <div className="h-5 bg-slate-200 rounded w-4/5 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-2/5" />
              </div>
            ))}
          </div>
        ) : ponencias.length === 0 ? (
          <div className="text-center py-20 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <p className="text-white/70 font-medium">No tenés ponencias asignadas.</p>
            <p className="text-white/50 text-sm mt-1">
              El administrador te asignará eventos próximamente.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ponencias.map(p => (
              <PonenciaCard key={p.id} ponencia={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
