'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/components/auth/AuthProvider';
import api from '@/lib/api';
import type { Evento, Stats, PonenteAdmin, UserAdmin, PaginatedResponse, Survey, Pregunta, TipoPregunta, AttendanceResponse } from '@/types/api';

type Tab = 'estadisticas' | 'eventos' | 'encuestas' | 'asistencias' | 'usuarios' | 'ponentes';

const NAV: { id: Tab; label: string }[] = [
  { id: 'estadisticas', label: 'Estadísticas' },
  { id: 'eventos', label: 'Eventos' },
  { id: 'encuestas', label: 'Encuestas' },
  { id: 'asistencias', label: 'Asistencias' },
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'ponentes', label: 'Ponentes' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

// ─── Stats ───────────────────────────────────────────────────────────────────

function StatsPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Stats>('/stats').then(res => setStats(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
            <div className="h-3 bg-slate-200 rounded w-2/3 mb-3" />
            <div className="h-8 bg-slate-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return <p className="text-slate-500 text-sm">No se pudieron cargar las estadísticas.</p>;

  const cards = [
    { label: 'Usuarios', value: stats.totalUsuarios },
    { label: 'Eventos', value: stats.totalEventos },
    { label: 'Asistencias', value: stats.totalAsistencias },
    { label: 'Ponentes', value: stats.totalPonentes },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(c => (
        <div key={c.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{c.label}</p>
          <p className="text-3xl font-bold text-slate-900">{c.value.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Event Form Modal ────────────────────────────────────────────────────────

interface EventFormProps {
  evento?: Evento;
  onClose: () => void;
  onSave: () => void;
}

function EventForm({ evento, onClose, onSave }: EventFormProps) {
  const isEdit = !!evento;
  const [form, setForm] = useState({
    titulo: evento?.titulo ?? '',
    descripcion: evento?.descripcion ?? '',
    fechaHora: evento?.fechaHora ? new Date(evento.fechaHora).toISOString().slice(0, 16) : '',
    linkVirtual: evento?.linkVirtual ?? '',
    ubicacionPresencial: evento?.ubicacionPresencial ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        titulo: form.titulo,
        descripcion: form.descripcion || undefined,
        fechaHora: new Date(form.fechaHora).toISOString(),
        linkVirtual: form.linkVirtual || undefined,
        ubicacionPresencial: form.ubicacionPresencial || undefined,
      };
      if (isEdit) {
        await api.put(`/eventos/${evento!.id}`, payload);
      } else {
        await api.post('/eventos', payload);
      }
      onSave();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Error al guardar el evento.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 w-full max-w-lg my-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-5">{isEdit ? 'Editar evento' : 'Nuevo evento'}</h3>
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
            <input required value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
            <textarea value={form.descripcion ?? ''} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} rows={3} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha y hora *</label>
            <input required type="datetime-local" value={form.fechaHora} onChange={e => setForm(p => ({ ...p, fechaHora: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación presencial</label>
            <input value={form.ubicacionPresencial ?? ''} onChange={e => setForm(p => ({ ...p, ubicacionPresencial: e.target.value }))} className={inputCls} placeholder="Ej: Auditorio Municipal" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Link virtual</label>
            <input value={form.linkVirtual ?? ''} onChange={e => setForm(p => ({ ...p, linkVirtual: e.target.value }))} className={inputCls} placeholder="https://..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-60 text-sm">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Eventos Panel ────────────────────────────────────────────────────────────

function EventosPanel() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editEvento, setEditEvento] = useState<Evento | undefined>();

  const fetchEventos = useCallback(() => {
    setLoading(true);
    api.get<Evento[]>('/eventos/all')
      .then(res => setEventos(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchEventos(); }, [fetchEventos]);

  const togglePublicado = async (ev: Evento) => {
    await api.patch(`/eventos/${ev.id}/publish`);
    fetchEventos();
  };

  const eliminar = async (id: string) => {
    if (!confirm('¿Seguro que querés eliminar este evento?')) return;
    await api.delete(`/eventos/${id}`);
    fetchEventos();
  };

  if (loading) return <div className="animate-pulse h-40 bg-slate-200 rounded-xl" />;

  return (
    <div>
      {(showForm || editEvento) && (
        <EventForm
          evento={editEvento}
          onClose={() => { setShowForm(false); setEditEvento(undefined); }}
          onSave={fetchEventos}
        />
      )}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Eventos</h2>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">
          Nuevo evento
        </button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Título</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {eventos.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-sm">No hay eventos.</td></tr>
              ) : (
                eventos.map(ev => (
                  <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{ev.titulo}</td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                      {new Date(ev.fechaHora).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        ev.publicado ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {ev.publicado ? 'Publicado' : 'Oculto'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => setEditEvento(ev)} className="text-xs text-slate-500 hover:text-slate-700 font-medium">Editar</button>
                        <button onClick={() => togglePublicado(ev)} className="text-xs text-blue-500 hover:text-blue-700 font-medium">
                          {ev.publicado ? 'Ocultar' : 'Publicar'}
                        </button>
                        <button onClick={() => eliminar(ev.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Encuestas Panel ──────────────────────────────────────────────────────────

const TIPOS_PREGUNTA: { value: TipoPregunta; label: string }[] = [
  { value: 'OPCION_UNICA', label: 'Opción única' },
  { value: 'MULTIPLE', label: 'Múltiple' },
  { value: 'ESCALA', label: 'Escala' },
  { value: 'ABIERTA_CORTO', label: 'Abierta corta' },
  { value: 'ABIERTA_LARGO', label: 'Abierta larga' },
];

function EncuestasPanel() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventoId, setEventoId] = useState('');
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loadingSurvey, setLoadingSurvey] = useState(false);
  const [creandoSurvey, setCreandoSurvey] = useState(false);
  const [tituloSurvey, setTituloSurvey] = useState('Encuesta del evento');
  const [showAddQ, setShowAddQ] = useState(false);
  const [newQ, setNewQ] = useState<{
    tipo: TipoPregunta; texto: string; opciones: string; seccion: 'ANALISIS' | 'PROPUESTAS'; esRequerida: boolean; escalaMin: string; escalaMax: string;
  }>({ tipo: 'ABIERTA_CORTO', texto: '', opciones: '', seccion: 'ANALISIS', esRequerida: false, escalaMin: '1', escalaMax: '5' });
  const [savingQ, setSavingQ] = useState(false);

  useEffect(() => {
    api.get<Evento[]>('/eventos/all').then(res => setEventos(res.data));
  }, []);

  const loadSurvey = useCallback(async (id: string) => {
    if (!id) return;
    setLoadingSurvey(true);
    try {
      const { data } = await api.get<Survey | null>(`/eventos/${id}/survey`);
      setSurvey(data);
    } finally {
      setLoadingSurvey(false);
    }
  }, []);

  const handleSelectEvento = (id: string) => {
    setEventoId(id);
    setSurvey(null);
    if (id) loadSurvey(id);
  };

  const crearSurvey = async () => {
    setCreandoSurvey(true);
    try {
      const { data } = await api.post<Survey>(`/eventos/${eventoId}/survey`, { titulo: tituloSurvey });
      setSurvey(data);
    } finally {
      setCreandoSurvey(false);
    }
  };

  const agregarPregunta = async () => {
    if (!survey) return;
    setSavingQ(true);
    try {
      const payload: Record<string, unknown> = {
        tipo: newQ.tipo,
        texto: newQ.texto,
        seccion: newQ.seccion,
        esRequerida: newQ.esRequerida,
      };
      if (newQ.tipo === 'OPCION_UNICA' || newQ.tipo === 'MULTIPLE') {
        payload.opciones = newQ.opciones.split('\n').map(s => s.trim()).filter(Boolean);
      }
      if (newQ.tipo === 'ESCALA') {
        payload.escalaMin = parseInt(newQ.escalaMin);
        payload.escalaMax = parseInt(newQ.escalaMax);
      }
      await api.post(`/surveys/${survey.id}/questions`, payload);
      await loadSurvey(eventoId);
      setShowAddQ(false);
      setNewQ({ tipo: 'ABIERTA_CORTO', texto: '', opciones: '', seccion: 'ANALISIS', esRequerida: false, escalaMin: '1', escalaMax: '5' });
    } finally {
      setSavingQ(false);
    }
  };

  const eliminarPregunta = async (qId: string) => {
    if (!confirm('¿Eliminás esta pregunta?')) return;
    await api.delete(`/questions/${qId}`);
    await loadSurvey(eventoId);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Gestión de encuestas</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-1">Seleccioná un evento</label>
        <select
          value={eventoId}
          onChange={e => handleSelectEvento(e.target.value)}
          className={inputCls}
        >
          <option value="">— Seleccionar evento —</option>
          {eventos.map(ev => (
            <option key={ev.id} value={ev.id}>{ev.titulo}</option>
          ))}
        </select>
      </div>

      {eventoId && loadingSurvey && (
        <div className="animate-pulse h-24 bg-slate-200 rounded-xl" />
      )}

      {eventoId && !loadingSurvey && !survey && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <p className="text-sm text-slate-600 mb-4">Este evento no tiene encuesta. Creá una:</p>
          <div className="flex gap-3">
            <input
              value={tituloSurvey}
              onChange={e => setTituloSurvey(e.target.value)}
              className={`${inputCls} flex-1`}
              placeholder="Título de la encuesta"
            />
            <button
              onClick={crearSurvey}
              disabled={creandoSurvey}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg disabled:opacity-60"
            >
              {creandoSurvey ? 'Creando...' : 'Crear encuesta'}
            </button>
          </div>
        </div>
      )}

      {survey && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-900">{survey.titulo}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{survey.questions.length} pregunta(s)</p>
            </div>
            <button
              onClick={() => setShowAddQ(v => !v)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg"
            >
              + Agregar pregunta
            </button>
          </div>

          {/* Formulario nueva pregunta */}
          {showAddQ && (
            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Tipo</label>
                  <select value={newQ.tipo} onChange={e => setNewQ(p => ({ ...p, tipo: e.target.value as TipoPregunta }))} className={inputCls}>
                    {TIPOS_PREGUNTA.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Sección</label>
                  <select value={newQ.seccion} onChange={e => setNewQ(p => ({ ...p, seccion: e.target.value as 'ANALISIS' | 'PROPUESTAS' }))} className={inputCls}>
                    <option value="ANALISIS">Análisis</option>
                    <option value="PROPUESTAS">Propuestas</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Texto de la pregunta</label>
                <input value={newQ.texto} onChange={e => setNewQ(p => ({ ...p, texto: e.target.value }))} className={inputCls} placeholder="¿Cómo evaluás...?" />
              </div>
              {(newQ.tipo === 'OPCION_UNICA' || newQ.tipo === 'MULTIPLE') && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Opciones (una por línea)</label>
                  <textarea value={newQ.opciones} onChange={e => setNewQ(p => ({ ...p, opciones: e.target.value }))} rows={3} className={inputCls} placeholder={'Opción A\nOpción B\nOpción C'} />
                </div>
              )}
              {newQ.tipo === 'ESCALA' && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Mínimo</label>
                    <input type="number" value={newQ.escalaMin} onChange={e => setNewQ(p => ({ ...p, escalaMin: e.target.value }))} className={inputCls} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Máximo</label>
                    <input type="number" value={newQ.escalaMax} onChange={e => setNewQ(p => ({ ...p, escalaMax: e.target.value }))} className={inputCls} />
                  </div>
                </div>
              )}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newQ.esRequerida} onChange={e => setNewQ(p => ({ ...p, esRequerida: e.target.checked }))} className="w-4 h-4 rounded text-blue-500" />
                <span className="text-xs text-slate-600">Pregunta requerida</span>
              </label>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAddQ(false)} className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-100">Cancelar</button>
                <button type="button" onClick={agregarPregunta} disabled={savingQ || !newQ.texto} className="flex-1 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-60">
                  {savingQ ? 'Guardando...' : 'Guardar pregunta'}
                </button>
              </div>
            </div>
          )}

          {/* Lista de preguntas */}
          {survey.questions.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No hay preguntas aún.</p>
          ) : (
            <div className="space-y-3">
              {survey.questions.map((q: Pregunta, i: number) => (
                <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{q.texto}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {TIPOS_PREGUNTA.find(t => t.value === q.tipo)?.label} · {q.seccion === 'ANALISIS' ? 'Análisis' : 'Propuestas'}
                      {q.esRequerida && ' · Requerida'}
                    </p>
                    {q.opciones.length > 0 && (
                      <p className="text-xs text-slate-400 mt-0.5">Opciones: {q.opciones.join(', ')}</p>
                    )}
                  </div>
                  <button onClick={() => eliminarPregunta(q.id)} className="shrink-0 text-xs text-red-400 hover:text-red-600 font-medium">
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Asistencias Panel ────────────────────────────────────────────────────────

function AsistenciasPanel() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventoId, setEventoId] = useState('');
  const [asistencias, setAsistencias] = useState<AttendanceResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<Evento[]>('/eventos/all').then(res => setEventos(res.data));
  }, []);

  const loadAsistencias = async (id: string) => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await api.get<AttendanceResponse[]>(`/attendance/event/${id}`);
      setAsistencias(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id: string) => {
    setEventoId(id);
    setAsistencias([]);
    if (id) loadAsistencias(id);
  };

  const presenciales = asistencias.filter(a => a.tipoAsistencia === 'PRESENCIAL').length;
  const virtuales = asistencias.filter(a => a.tipoAsistencia === 'VIRTUAL').length;

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Asistencias por evento</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-1">Seleccioná un evento</label>
        <select value={eventoId} onChange={e => handleSelect(e.target.value)} className={inputCls}>
          <option value="">— Seleccionar evento —</option>
          {eventos.map(ev => <option key={ev.id} value={ev.id}>{ev.titulo}</option>)}
        </select>
      </div>

      {eventoId && loading && <div className="animate-pulse h-40 bg-slate-200 rounded-xl" />}

      {eventoId && !loading && asistencias.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <p className="text-slate-400 text-sm">No hay asistencias confirmadas para este evento.</p>
        </div>
      )}

      {asistencias.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total', value: asistencias.length },
              { label: 'Presenciales', value: presenciales },
              { label: 'Virtuales', value: virtuales },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{c.label}</p>
                <p className="text-2xl font-bold text-slate-900">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Usuario</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Modalidad</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Confirmó</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {asistencias.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{a.user?.nombres ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-500">{a.user?.email ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          a.tipoAsistencia === 'PRESENCIAL'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-violet-50 text-violet-600 border border-violet-100'
                        }`}>
                          {a.tipoAsistencia === 'PRESENCIAL' ? 'Presencial' : 'Virtual'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 hidden md:table-cell text-xs">
                        {a.confirmedAt ? new Date(a.confirmedAt).toLocaleString('es-MX') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Usuarios Panel ───────────────────────────────────────────────────────────

function UsuariosPanel() {
  const [usuarios, setUsuarios] = useState<UserAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 50;

  const fetchUsuarios = useCallback((p: number) => {
    setLoading(true);
    api.get<PaginatedResponse<UserAdmin>>(`/users?page=${p}&limit=${limit}`)
      .then(res => {
        setUsuarios(res.data.data);
        setTotal(res.data.total);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchUsuarios(page); }, [fetchUsuarios, page]);

  const exportarCSV = () => {
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/export`;
    const token = localStorage.getItem('accessToken');
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'usuarios.csv';
        a.click();
      });
  };

  const totalPages = Math.ceil(total / limit);

  if (loading) return <div className="animate-pulse h-40 bg-slate-200 rounded-xl" />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Usuarios registrados</h2>
          <p className="text-xs text-slate-400 mt-0.5">{total.toLocaleString()} total</p>
        </div>
        <button onClick={exportarCSV} className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">
          Exportar CSV
        </button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Género</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Ocupación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-sm">No hay usuarios.</td></tr>
              ) : (
                usuarios.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{u.nombres} {u.apaterno}</td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">{u.genero ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">{u.ocupacion ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">Página {page} de {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40">Anterior</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40">Siguiente</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Ponentes Panel ───────────────────────────────────────────────────────────

function PonenteForm({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/ponentes', { nombre: form.nombre, email: form.email, password: form.password, bio: form.bio || undefined });
      onSave();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Error al crear el ponente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Nuevo ponente</h3>
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
            <input required value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
            <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña *</label>
            <input required type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className={inputCls} placeholder="Mínimo 8 caracteres" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Biografía</label>
            <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={2} className={inputCls} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 text-sm">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-60 text-sm">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PonentesPanelContent() {
  const [ponentes, setPonentes] = useState<PonenteAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchPonentes = useCallback(() => {
    api.get<PonenteAdmin[]>('/ponentes').then(res => setPonentes(res.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPonentes(); }, [fetchPonentes]);

  const eliminar = async (id: string) => {
    if (!confirm('¿Seguro que querés eliminar este ponente?')) return;
    await api.delete(`/ponentes/${id}`);
    fetchPonentes();
  };

  if (loading) return <div className="animate-pulse h-40 bg-slate-200 rounded-xl" />;

  return (
    <div>
      {showForm && <PonenteForm onClose={() => setShowForm(false)} onSave={fetchPonentes} />}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Ponentes</h2>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">
          Nuevo ponente
        </button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Ponencias</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ponentes.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-sm">No hay ponentes registrados.</td></tr>
              ) : (
                ponentes.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{p.nombre}</td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{p.email}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">{p._count?.ponencias ?? 0}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => eliminar(p.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('estadisticas');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #063a3a 0%, #0a5252 55%, #1a2f5a 100%)' }}>
        <div className="pointer-events-none absolute inset-0 select-none">
          <Image src="/papiro2.svg" alt="" width={320} height={320} className="absolute -left-16 top-1/4 opacity-[0.12] rotate-12" />
          <Image src="/papiro2.svg" alt="" width={280} height={280} className="absolute -right-12 bottom-1/4 opacity-[0.10] -rotate-12" />
          <Image src="/papiro3.svg" alt="" width={200} height={200} className="absolute left-1/4 -bottom-8 opacity-[0.08]" />
        </div>
        <div className="relative z-10 text-white/60">Verificando permisos...</div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-white/20 bg-white/10 backdrop-blur-sm px-3 py-6">
        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider px-3 mb-3">Administración</p>
        <nav className="space-y-0.5">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                tab === item.id ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile tabs */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/10 backdrop-blur-sm border-t border-white/20 flex overflow-x-auto">
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`flex-1 min-w-max py-3 px-2 text-xs font-medium transition-colors ${
              tab === item.id ? 'text-white' : 'text-white/60'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-8 pb-20 md:pb-8" style={{ background: 'linear-gradient(135deg, #063a3a 0%, #0a5252 55%, #1a2f5a 100%)' }}>
        <h1 className="text-2xl font-bold text-white mb-6 hidden md:block">
          {NAV.find(n => n.id === tab)?.label}
        </h1>

        {tab === 'estadisticas' && <StatsPanel />}
        {tab === 'eventos' && <EventosPanel />}
        {tab === 'encuestas' && <EncuestasPanel />}
        {tab === 'asistencias' && <AsistenciasPanel />}
        {tab === 'usuarios' && <UsuariosPanel />}
        {tab === 'ponentes' && <PonentesPanelContent />}
      </div>
    </div>
  );
}
