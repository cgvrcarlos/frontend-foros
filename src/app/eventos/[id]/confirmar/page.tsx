'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';
import api from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import type { Evento, Pregunta, TipoAsistencia, AttendanceResponse, AnswerItem, MyAttendance } from '@/types/api';

// ─── QR Display ───────────────────────────────────────────────────────────────

function QRDisplay({ code, eventoId }: { code: string; eventoId: string }) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `qr-${eventoId}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div ref={canvasRef} className="bg-surface rounded-xl p-4 border-4 border-teal-dark">
        <QRCodeCanvas value={code} size={200} level="M" includeMargin={false} />
      </div>
      <p className="font-mono text-sm text-text-muted bg-bg-light px-4 py-2 rounded-lg break-all">{code}</p>
      <SecondaryButton size="sm" onClick={handleDownload}>Descargar QR</SecondaryButton>
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
    'w-full px-3 py-2.5 rounded-lg border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal-accent focus:border-transparent transition';

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
                className="w-4 h-4 text-teal-accent border-border focus:ring-teal-accent"
              />
              <span className="text-sm text-text-primary group-hover:text-text-primary transition-colors">{op}</span>
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
                  className="w-4 h-4 rounded text-teal-accent border-border focus:ring-teal-accent"
                />
                <span className="text-sm text-text-primary group-hover:text-text-primary transition-colors">{op}</span>
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
            className="w-24 px-3 py-2.5 rounded-lg border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-teal-accent"
          />
          <span className="text-sm text-text-muted">
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
                i <= idx ? 'bg-teal-accent text-white' : 'bg-bg-light text-text-muted'
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
            <span className={`text-xs font-medium hidden sm:block ${i === idx ? 'text-text-primary' : 'text-text-muted'}`}>
              {STEP_LABELS[s]}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-px mx-2 ${i < idx ? 'bg-teal-accent/40' : 'bg-border'}`} />
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
  const [existingAttendance, setExistingAttendance] = useState<MyAttendance | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/auth/register?redirect=/eventos/${params.id}`);
    }
  }, [authLoading, user, router, params.id]);

  useEffect(() => {
    const eventoId = params.id as string;
    if (!eventoId) return;
    // Fetch evento Y mis attendances en paralelo
    Promise.all([
      api.get<Evento>(`/eventos/${eventoId}`),
      api.get<MyAttendance[]>('/attendance/my').catch(() => ({ data: [] })),
    ])
      .then(([eventoRes, attendancesRes]) => {
        setEvento(eventoRes.data);
        // Busco si ya tengo asistencia para este evento
        const myAttendance = attendancesRes.data.find(
          (a) => a.event.id === eventoId
        );
        if (myAttendance) {
          setExistingAttendance(myAttendance);
          // Ya tengo asistencia → ir directo a confirmación
          setResultado({
            id: myAttendance.id,
            qrCode: myAttendance.qrCode,
            tipoAsistencia: myAttendance.tipoAsistencia,
            confirmedAt: myAttendance.confirmedAt,
          });
          setStep('confirmacion');
        }
      })
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
      const answers: AnswerItem[] = Object.entries(respuestas).map(([questionId, answer]) => ({
        questionId,
        answer,
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
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link href="/eventos" className="hover:text-text-primary transition-colors">Eventos</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link href={`/eventos/${params.id}`} className="hover:text-text-primary transition-colors truncate">
          {evento?.titulo || 'Evento'}
        </Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-text-primary font-medium">Confirmar</span>
      </nav>

      <div className="bg-surface rounded-xl border border-border shadow-sm p-6 md:p-8">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Confirmar asistencia</h1>
        {evento && <p className="text-sm text-text-muted mb-8">{evento.titulo}</p>}

        <StepBar current={step} />

        {/* ── Step 1: Tipo de asistencia ── */}
        {step === 'modalidad' && (
          <div>
            <h2 className="text-base font-semibold text-text-primary mb-4">¿Cómo desea participar?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {(['PRESENCIAL', 'VIRTUAL'] as TipoAsistencia[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTipoAsistencia(m)}
                  className={`p-5 rounded-xl border-2 text-left transition-all ${
                    tipoAsistencia === m
                      ? 'border-teal-accent bg-teal-soft/10'
                      : 'border-border hover:border-teal-accent/50'
                  }`}
                >
                  <div className={`text-sm font-semibold mb-1 ${tipoAsistencia === m ? 'text-teal-dark' : 'text-text-primary'}`}>
                    {m === 'PRESENCIAL' ? 'Presencial' : 'Virtual'}
                  </div>
                  <p className="text-xs text-text-muted">
                    {m === 'PRESENCIAL'
                      ? 'Asiste en persona al lugar del evento.'
                      : 'Participa de forma remota por plataforma virtual.'}
                  </p>
                </button>
              ))}
            </div>

            <PrimaryButton
              onClick={() => hasSurvey ? setStep('encuesta') : handleConfirmar()}
              disabled={submitting}
              className="w-full"
            >
              {submitting ? 'Confirmando...' : hasSurvey ? 'Continuar a encuesta' : 'Confirmar asistencia'}
            </PrimaryButton>
            {submitError && (
              <p className="mt-3 text-sm text-red-500 text-center">{submitError}</p>
            )}
          </div>
        )}

        {/* ── Step 2: Encuesta ── */}
        {step === 'encuesta' && hasSurvey && (
          <div>
            <h2 className="text-base font-semibold text-text-primary mb-2">
              {evento?.survey?.titulo || 'Encuesta del evento'}
            </h2>
            <p className="text-sm text-text-muted mb-6">
              Responda las siguientes preguntas antes de confirmar su asistencia.
            </p>

            <div className="space-y-7">
              {(['ANALISIS', 'PROPUESTAS'] as const).map((seccion) => {
                const pSection = preguntas.filter(p => p.seccion === seccion);
                if (pSection.length === 0) return null;
                return (
                  <div key={seccion}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">
                      {seccion === 'ANALISIS' ? 'Análisis' : 'Propuestas'}
                    </p>
                    <div className="space-y-6">
                      {pSection.map(p => (
                        <div key={p.id}>
                          <p className="text-sm font-medium text-text-primary mb-2">
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
              <SecondaryButton
                type="button"
                onClick={() => setStep('modalidad')}
                className="flex-1"
              >
                Atrás
              </SecondaryButton>
              <PrimaryButton
                type="button"
                onClick={handleConfirmar}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? 'Confirmando...' : 'Confirmar asistencia'}
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* ── Step 3: QR ── */}
        {step === 'confirmacion' && resultado && (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-teal-soft/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-teal-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-1">Asistencia confirmada</h2>
            <p className="text-sm text-text-muted mb-6">
              Modalidad: {resultado.tipoAsistencia === 'PRESENCIAL' ? 'Presencial' : 'Virtual'}
            </p>

            {resultado.tipoAsistencia === 'VIRTUAL' && evento?.linkVirtual ? (
              <div className="py-4">
                <p className="text-sm text-text-muted mb-4">
                  Acceda al evento virtual:
                </p>
                <a
                  href={evento.linkVirtual}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-teal-accent text-white font-semibold rounded-lg hover:bg-teal-dark transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Entrar al evento virtual
                </a>
                <p className="text-xs text-text-muted mt-4">
                  El link se abrirá en una nueva pestaña
                </p>
              </div>
            ) : (
              <>
                <QRDisplay code={resultado.qrCode} eventoId={params.id} />

                <p className="text-xs text-text-muted mt-6 max-w-sm mx-auto">
                  Guarde o tome captura de su código QR. Lo necesitará para acceder al evento.
                </p>
              </>
            )}

            <div className="mt-8">
              <SecondaryButton href="/eventos">Ver más eventos</SecondaryButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
