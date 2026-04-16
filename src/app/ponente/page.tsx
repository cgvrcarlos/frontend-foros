'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import api from '@/lib/api';

// Tipos específicos para el panel del ponente
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
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-slate-400">Verificando permisos...</div>
      </div>
    );
  }

  if (!user || user.role !== 'PONENTE') return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Mi panel</h1>
        <p className="text-slate-500">
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
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium">No tenés ponencias asignadas.</p>
          <p className="text-sm text-slate-400 mt-1">El administrador te asignará eventos próximamente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ponencias.map(p => <PonenciaCard key={p.id} ponencia={p} />)}
        </div>
      )}
    </div>
  );
}
