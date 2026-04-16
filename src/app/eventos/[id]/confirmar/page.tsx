'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';
import type { Evento, Pregunta, TipoAsistencia, AttendanceResponse, AnswerItem } from '@/types/api';

// ─── QR Display ───────────────────────────────────────────────────────────────

function QRDisplay({ code }: { code: string }) {
  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="w-48 h-48 bg-white border-4 border-slate-900 rounded-xl flex items-center justify-center p-3">
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
          <rect x="0" y="0" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="8" />
          <rect x="10" y="10" width="10" height="10" />
          <rect x="70" y="0" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="8" />
          <rect x="80" y="10" width="10" height="10" />
          <rect x="0" y="70" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="8" />
          <rect x="10" y="80" width="10" height="10" />
          <rect x="40" y="10" width="5" height="5" />
          <rect x="50" y="10" width="5" height="5" />
          <rect x="40" y="20" width="10" height="5" />
          <rect x="10" y="40" width="5" height="5" />
          <rect x="20" y="50" width="5" height="10" />
          <rect x="40" y="40" width="20" height="20" />
          <rect x="65" y="40" width="5" height="5" />
          <rect x="75" y="40" width="5" height="10" />
          <rect x="85" y="45" width="5" height="5" />
          <rect x="65" y="55" width="10" height="5" />
          <rect x="40" y="65" width="5" height="10" />
          <rect x="50" y="70" width="10" height="5" />
          <rect x="65" y="65" width="5" height="5" />
          <rect x="75" y="70" width="10" height="5" />
          <rect x="85" y="65" width="5" height="10" />
        </svg>
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">Código de acceso</p>
        <p className="text-sm font-mono font-semibold text-slate-800 bg-slate-100 px-4 py-2 rounded-lg break-all">
          {code}
        </p>
      </div>
    </div>
  );
}

// ─── Survey Question ──────────────────────────────────────────────────────────

function PreguntaInput({
  pregunta,
  value,
  onChange,
}: {
  pregunta: Pregunta;
  value: string | string[];
  onChange: (val: string | string[]) => void;
}) {
  const baseInput =
    'w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow';

  switch (pregunta.tipo) {
    case 'OPCION_UNICA':
      return (
        <div className="space-y-2">
          {pregunta.opciones?.map((op, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name={pregunta.id}
                value={op}
                checked={value === op}
                onChange={() => onChange(op)}
                className="w-4 h-4 text-blue-500 border-slate-300 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{op}</span>
            </label>
          ))}
        </div>
      );

    case 'MULTIPLE':
      return (
        <div className="space-y-2">
          {pregunta.opciones?.map((op, i) => {
            const selected = Array.isArray(value) ? value : [];
            const isChecked = selected.includes(op);
            return (
              <label key={i} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  value={op}
                  checked={isChecked}
                  onChange={() => {
                    if (isChecked) onChange(selected.filter((v) => v !== op));
                    else onChange([...selected, op]);
                  }}
                  className="w-4 h-4 rounded text-blue-500 border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{op}</span>
              </label>
            );
          })}
        </div>
      );

    case 'ESCALA':
      return (
        <div className="flex items-center gap-4">
          <input
            type="number"
            min={pregunta.escalaMin ?? 1}
            max={pregunta.escalaMax ?? 10}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-24 px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-400">
            ({pregunta.escalaMin ?? 1} — {pregunta.escalaMax ?? 10})
          </span>
        </div>
      );

    case 'ABIERTA_CORTO':
      return (
        <input
          type="text"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          className={baseInput}
          placeholder="Tu respuesta..."
        />
      );

    case 'ABIERTA_LARGO':
      return (
        <textarea
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className={baseInput}
          placeholder="Tu respuesta..."
        />
      );
  }
}

// ─── Steps ────────────────────────────────────────────────────────────────────

type Step = 'modalidad' | 'encuesta' | 'confirmacion';

const STEP_LABELS: Record<Step, string> = {
  modalidad: 'Modalidad',
  encuesta: 'Encuesta',
  confirmacion: 'Confirmacion',
};

function StepBar({ current }: { current: Step }) {
  const steps: Step[] = ['modalidad', 'encuesta', 'confirmacion'];
  const idx = steps.indexOf(current);
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                i <= idx ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {i < idx ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === idx ? 'text-slate-900' : 'text-slate-400'}`}>
              {STEP_LABELS[s]}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-px mx-2 ${i < idx ? 'bg-blue-300' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ConfirmarPage() {
  const params = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [evento, setEvento] = useState<Evento | null>(null);
  const [loadingEvento, setLoadingEvento] = useState(true);
  const [step, setStep] = useState<Step>('modalidad');
  const [tipoAsistencia, setTipoAsistencia] = useState<TipoAsistencia>('PRESENCIAL');
  const [respuestas, setRespuestas] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [resultado, setResultado] = useState<AttendanceResponse | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/auth/register?redirect=/eventos/${params.id}/confirmar`);
    }
  }, [authLoading, user, router, params.id]);

  useEffect(() => {
    if (!params.id) return;
    api.get<Evento>(`/eventos/${params.id}`)
      .then(res => setEvento(res.data))
      .catch(() => {})
      .finally(() => setLoadingEvento(false));
  }, [params.id]);

  const setRespuesta = useCallback((preguntaId: string, val: string | string[]) => {
    setRespuestas(prev => ({ ...prev, [preguntaId]: val }));
  }, []);

  const handleConfirmar = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const answers: AnswerItem[] = Object.entries(respuestas).map(([questionId, respuesta]) => ({
        questionId,
        respuesta,
      }));

      const { data } = await api.post<AttendanceResponse>('/attendance', {
        eventId: params.id,
        tipoAsistencia,
        answers,
      });
      setResultado(data);
      setStep('confirmacion');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setSubmitError(axiosError.response?.data?.message || 'Error al confirmar asistencia.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loadingEvento) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-2/3" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const preguntas = evento?.survey?.questions
    ? [...evento.survey.questions].sort((a, b) => {
        if (a.seccion === b.seccion) return a.orden - b.orden;
        return a.seccion === 'ANALISIS' ? -1 : 1;
      })
    : [];

  const hasSurvey = preguntas.length > 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/eventos" className="hover:text-slate-700">Eventos</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link href={`/eventos/${params.id}`} className="hover:text-slate-700 truncate">
          {evento?.titulo || 'Evento'}
        </Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-900 font-medium">Confirmar</span>
      </nav>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Confirmar asistencia</h1>
        {evento && <p className="text-sm text-slate-500 mb-8">{evento.titulo}</p>}

        <StepBar current={step} />

        {/* ── Step 1: Tipo de asistencia ── */}
        {step === 'modalidad' && (
          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-4">¿Cómo vas a participar?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {(['PRESENCIAL', 'VIRTUAL'] as TipoAsistencia[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTipoAsistencia(m)}
                  className={`p-5 rounded-xl border-2 text-left transition-all ${
                    tipoAsistencia === m
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`text-sm font-semibold mb-1 ${tipoAsistencia === m ? 'text-blue-700' : 'text-slate-900'}`}>
                    {m === 'PRESENCIAL' ? 'Presencial' : 'Virtual'}
                  </div>
                  <p className="text-xs text-slate-500">
                    {m === 'PRESENCIAL'
                      ? 'Asistís en persona al lugar del evento.'
                      : 'Participás de forma remota por plataforma virtual.'}
                  </p>
                </button>
              ))}
            </div>

            <button
              onClick={() => hasSurvey ? setStep('encuesta') : handleConfirmar()}
              disabled={submitting}
              className="w-full py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-60 transition-colors"
            >
              {submitting ? 'Confirmando...' : hasSurvey ? 'Continuar a encuesta' : 'Confirmar asistencia'}
            </button>
            {submitError && (
              <p className="mt-3 text-sm text-red-500 text-center">{submitError}</p>
            )}
          </div>
        )}

        {/* ── Step 2: Encuesta ── */}
        {step === 'encuesta' && hasSurvey && (
          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-2">
              {evento?.survey?.titulo || 'Encuesta del evento'}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Respondé las siguientes preguntas antes de confirmar tu asistencia.
            </p>

            <div className="space-y-7">
              {(['ANALISIS', 'PROPUESTAS'] as const).map((seccion) => {
                const pSection = preguntas.filter(p => p.seccion === seccion);
                if (pSection.length === 0) return null;
                return (
                  <div key={seccion}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                      {seccion === 'ANALISIS' ? 'Análisis' : 'Propuestas'}
                    </p>
                    <div className="space-y-6">
                      {pSection.map(p => (
                        <div key={p.id}>
                          <p className="text-sm font-medium text-slate-900 mb-2">
                            {p.texto}
                            {p.esRequerida && <span className="text-red-400 ml-1">*</span>}
                          </p>
                          <PreguntaInput
                            pregunta={p}
                            value={respuestas[p.id] ?? (p.tipo === 'MULTIPLE' ? [] : '')}
                            onChange={(val) => setRespuesta(p.id, val)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {submitError && (
              <div className="mt-6 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                {submitError}
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => setStep('modalidad')}
                className="flex-1 py-3 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={handleConfirmar}
                disabled={submitting}
                className="flex-1 py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-60 transition-colors"
              >
                {submitting ? 'Confirmando...' : 'Confirmar asistencia'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: QR ── */}
        {step === 'confirmacion' && resultado && (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Asistencia confirmada</h2>
            <p className="text-sm text-slate-500 mb-6">
              Modalidad: {resultado.tipoAsistencia === 'PRESENCIAL' ? 'Presencial' : 'Virtual'}
            </p>

            <QRDisplay code={resultado.qrCode} />

            <p className="text-xs text-slate-400 mt-6 max-w-sm mx-auto">
              Guardá o tomá captura de tu código QR. Lo vas a necesitar para acceder al evento.
            </p>

            <Link
              href="/eventos"
              className="mt-8 inline-block px-6 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Ver más eventos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
