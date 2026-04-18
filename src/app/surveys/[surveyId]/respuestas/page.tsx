'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/auth/AuthProvider';
import api from '@/lib/api';

interface SurveyResponse {
  id: string;
  pregunta: { texto: string; tipo: string };
  valor: string | string[];
  usuario?: { nombres: string; email: string };
}

interface GroupedResponses {
  pregunta: string;
  tipo: string;
  respuestas: Array<{ valor: string | string[]; usuario?: string }>;
}

export default function SurveyResponsesPage() {
  const params = useParams<{ surveyId: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<GroupedResponses[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'ADMIN' && user.role !== 'PONENTE'))) {
      router.replace('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!params.surveyId || !user) return;

    api.get<SurveyResponse[]>(`/surveys/${params.surveyId}/responses`)
      .then(res => {
        const grouped: Record<string, GroupedResponses> = {};
        res.data.forEach(r => {
          const key = r.pregunta.texto;
          if (!grouped[key]) {
            grouped[key] = { pregunta: key, tipo: r.pregunta.tipo, respuestas: [] };
          }
          grouped[key].respuestas.push({
            valor: r.valor,
            usuario: r.usuario ? `${r.usuario.nombres} (${r.usuario.email})` : undefined,
          });
        });
        setData(Object.values(grouped));
      })
      .catch(() => setError('No se pudieron cargar las respuestas.'))
      .finally(() => setLoading(false));
  }, [params.surveyId, user]);

  if (authLoading || loading) {
    return (
      <div className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #063a3a 0%, #0a5252 55%, #1a2f5a 100%)' }}>
        <div className="pointer-events-none absolute inset-0 select-none">
          <Image src="/papiro2.svg" alt="" width={320} height={320} className="absolute -left-16 top-1/4 opacity-[0.12] rotate-12" />
          <Image src="/papiro2.svg" alt="" width={280} height={280} className="absolute -right-12 bottom-1/4 opacity-[0.10] -rotate-12" />
          <Image src="/papiro3.svg" alt="" width={200} height={200} className="absolute left-1/4 -bottom-8 opacity-[0.08]" />
        </div>
        <div className="relative z-10 animate-pulse">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-white/10 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-4rem)]"
      style={{ background: 'linear-gradient(135deg, #063a3a 0%, #0a5252 55%, #1a2f5a 100%)' }}>

      <div className="pointer-events-none absolute inset-0 select-none">
        <Image src="/papiro2.svg" alt="" width={320} height={320} className="absolute -left-16 top-1/4 opacity-[0.12] rotate-12" />
        <Image src="/papiro2.svg" alt="" width={280} height={280} className="absolute -right-12 bottom-1/4 opacity-[0.10] -rotate-12" />
        <Image src="/papiro3.svg" alt="" width={200} height={200} className="absolute left-1/4 -bottom-8 opacity-[0.08]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
          <Link
            href={user.role === 'ADMIN' ? '/admin' : '/ponente'}
            className="hover:text-white transition-colors"
          >
            {user.role === 'ADMIN' ? 'Admin' : 'Mi panel'}
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-white font-medium">Respuestas de encuesta</span>
        </nav>

        <h1 className="text-2xl font-bold text-white mb-6">Respuestas de encuesta</h1>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm mb-6">
            {error}
          </div>
        )}

        {data.length === 0 && !error ? (
          <div className="text-center py-16 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <p className="text-white/60">No hay respuestas registradas todavía.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {data.map((g, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
                <h2 className="font-semibold text-white mb-1">{g.pregunta}</h2>
                <p className="text-xs text-white/50 uppercase tracking-wide mb-4">
                  {g.respuestas.length} respuesta{g.respuestas.length !== 1 ? 's' : ''}
                </p>

                <div className="space-y-2">
                  {g.respuestas.map((r, j) => (
                    <div key={j} className="flex items-start gap-3 text-sm">
                      <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/60 font-medium">
                        {j + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-white/80">
                          {Array.isArray(r.valor) ? r.valor.join(', ') : r.valor}
                        </p>
                        {r.usuario && (
                          <p className="text-xs text-white/50 mt-0.5">{r.usuario}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div> 
  );
}
