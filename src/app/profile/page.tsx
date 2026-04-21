'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '@/components/auth/AuthProvider';
import { PageHero } from '@/components/ui/PageHero';
import { SectionCard } from '@/components/ui/SectionCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import api from '@/lib/api';
import type { User, Genero, GradoEstudios, SituacionLaboral, MyAttendance, AttendanceStatus } from '@/types/api';

function formatGenero(g?: string | null) {
  const map: Record<string, string> = {
    MASCULINO: 'Masculino',
    FEMENINO: 'Femenino',
    OTRO: 'Otro',
    NO_DICE: 'Prefiero no decir',
  };
  return g ? (map[g] ?? g) : undefined;
}

function formatGradoEstudios(g?: string | null) {
  const map: Record<string, string> = {
    PRIMARIA: 'Primaria',
    SECUNDARIA: 'Secundaria',
    PREPARATORIA: 'Preparatoria',
    LICENCIATURA: 'Licenciatura',
    POSGRADO: 'Posgrado',
    OTRO: 'Otro',
  };
  return g ? (map[g] ?? g) : undefined;
}

function formatSituacionLaboral(s?: string | null) {
  const map: Record<string, string> = {
    ESTUDIANTE: 'Estudiante',
    EMPLEADO: 'Empleado',
    AUTOEMPLEADO: 'Autoempleado',
    DESEMPLEADO: 'Desempleado',
    OTRO: 'Otro',
  };
return s ? (map[s] ?? s) : undefined;
}

const GENERO_OPTIONS: { value: Genero | ''; label: string }[] = [
  { value: '', label: 'Seleccionar...' },
  { value: 'MASCULINO', label: 'Masculino' },
  { value: 'FEMENINO', label: 'Femenino' },
  { value: 'OTRO', label: 'Otro' },
  { value: 'NO_DICE', label: 'Prefiero no decir' },
];

const GRADO_OPTIONS: { value: GradoEstudios | ''; label: string }[] = [
  { value: '', label: 'Seleccionar...' },
  { value: 'PRIMARIA', label: 'Primaria' },
  { value: 'SECUNDARIA', label: 'Secundaria' },
  { value: 'PREPARATORIA', label: 'Preparatoria' },
  { value: 'LICENCIATURA', label: 'Licenciatura' },
  { value: 'POSGRADO', label: 'Posgrado' },
  { value: 'OTRO', label: 'Otro' },
];

const SITUACION_OPTIONS: { value: SituacionLaboral | ''; label: string }[] = [
  { value: '', label: 'Seleccionar...' },
  { value: 'ESTUDIANTE', label: 'Estudiante' },
  { value: 'EMPLEADO', label: 'Empleado' },
  { value: 'AUTOEMPLEADO', label: 'Autoempleado' },
  { value: 'DESEMPLEADO', label: 'Desempleado' },
  { value: 'OTRO', label: 'Otro' },
];

const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent';

interface ProfileFormProps {
  user: User;
  onClose: () => void;
  onSave: () => void;
}

function ProfileEditForm({ user, onClose, onSave }: ProfileFormProps) {
  const [form, setForm] = useState({
    nombre: user.nombres || '',
    telefono: user.telefono || '',
    apaterno: user.apaterno || '',
    amaterno: user.amaterno || '',
    genero: user.genero || '',
    ocupacion: user.ocupacion || '',
    gradoEstudios: user.gradoEstudios || '',
    situacionLaboral: user.situacionLaboral || '',
    escuela: user.escuela || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload: Record<string, unknown> = {};
      if (form.nombre !== user.nombre) payload.nombre = form.nombre;
      if (form.telefono !== user.telefono) payload.telefono = form.telefono || undefined;
      if (form.apaterno !== user.apaterno) payload.apaterno = form.apaterno;
      if (form.amaterno !== user.amaterno) payload.amaterno = form.amaterno;
      if (form.genero) payload.genero = form.genero;
      if (form.ocupacion) payload.ocupacion = form.ocupacion;
      if (form.gradoEstudios) payload.gradoEstudios = form.gradoEstudios;
      if (form.situacionLaboral) payload.situacionLaboral = form.situacionLaboral;
      if (form.escuela) payload.escuela = form.escuela;

      await api.patch('/users/me', payload);
      onSave();
      onClose();
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setError(errObj.response?.data?.message || 'Error al guardar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 w-full max-w-lg my-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-5">Editar perfil</h3>
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre(s)</label>
            <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Apellido paterno</label>
              <input value={form.apaterno} onChange={e => setForm(p => ({ ...p, apaterno: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Apellido materno</label>
              <input value={form.amaterno} onChange={e => setForm(p => ({ ...p, amaterno: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
            <input value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))} className={inputCls} placeholder="Teléfono de contacto" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Género</label>
              <select value={form.genero} onChange={e => setForm(p => ({ ...p, genero: e.target.value }))} className={inputCls}>
                {GENERO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Grado de estudios</label>
              <select value={form.gradoEstudios} onChange={e => setForm(p => ({ ...p, gradoEstudios: e.target.value }))} className={inputCls}>
                {GRADO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ocupación</label>
            <input value={form.ocupacion} onChange={e => setForm(p => ({ ...p, ocupacion: e.target.value }))} className={inputCls} placeholder="Ej: Docente, Médico, Estudiante" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Situación laboral</label>
              <select value={form.situacionLaboral} onChange={e => setForm(p => ({ ...p, situacionLaboral: e.target.value }))} className={inputCls}>
                {SITUACION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Escuela / Institución</label>
              <input value={form.escuela} onChange={e => setForm(p => ({ ...p, escuela: e.target.value }))} className={inputCls} placeholder="Escuela donde estudias" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-orange-cta text-white font-medium hover:brightness-95 disabled:opacity-60 text-sm">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  CONFIRMADO: 'Confirmado',
  ASISTIO: 'Asistió',
  NO_ASISTIO: 'No asistió',
};

const STATUS_COLOR: Record<AttendanceStatus, string> = {
  CONFIRMADO: 'bg-yellow-100 text-yellow-800',
  ASISTIO: 'bg-green-100 text-green-800',
  NO_ASISTIO: 'bg-red-100 text-red-800',
};

function AttendanceQRCard({ attendance }: { attendance: MyAttendance }) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `qr-${attendance.event.id}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-border bg-bg-light">
      <div className="shrink-0">
        {attendance.tipoAsistencia === 'PRESENCIAL' ? (
          <div ref={canvasRef} className="bg-white rounded-lg p-2 border border-border inline-block">
            <QRCodeCanvas value={attendance.qrCode} size={96} level="M" includeMargin={false} />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-lg border border-border bg-white flex items-center justify-center text-text-muted text-xs text-center px-2">
            Virtual
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-text-primary text-sm truncate">{attendance.event.titulo}</p>
        <p className="text-xs text-text-muted mt-0.5">
          {new Date(attendance.event.fechaHora).toLocaleDateString('es-MX', {
            day: 'numeric', month: 'long', year: 'numeric',
          })}
        </p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[attendance.status]}`}>
            {STATUS_LABEL[attendance.status]}
          </span>
          <span className="text-xs text-text-muted">
            {attendance.tipoAsistencia === 'PRESENCIAL' ? 'Presencial' : 'Virtual'}
          </span>
        </div>
        {attendance.tipoAsistencia === 'PRESENCIAL' && (
          <button
            onClick={handleDownload}
            className="mt-2 text-xs text-teal-accent hover:underline"
          >
            Descargar QR
          </button>
        )}
        {attendance.tipoAsistencia === 'VIRTUAL' && attendance.event.linkVirtual && (
          <a
            href={attendance.event.linkVirtual}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs text-teal-accent hover:underline"
          >
            Acceder al evento virtual →
          </a>
        )}
      </div>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 py-2 border-b border-border last:border-0">
      <dt className="text-sm text-text-muted">{label}</dt>
      <dd className="text-text-primary font-medium">{value?.trim() ? value : '—'}</dd>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [myAttendances, setMyAttendances] = useState<MyAttendance[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Fetch full user data on mount
  useEffect(() => {
    if (user?.id) {
      api.get<User>('/users/me').then(res => setUserData(res.data)).catch(() => {});
      api.get<MyAttendance[]>('/attendance/my').then(res => setMyAttendances(res.data)).catch(() => {});
    }
  }, [user?.id]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const handleSave = () => {
    api.get<User>('/users/me').then(res => {
      setUserData(res.data);
    }).catch(() => {});
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-teal-dark">
        <p className="text-white/60">Cargando...</p>
      </div>
    );
  }

  if (!user) return null;

  const currentUser = userData || user;
  const nombreCompleto = `${currentUser.nombres || currentUser.nombre || ''} ${currentUser.apaterno || ''} ${currentUser.amaterno || ''}`.trim();

  return (
    <>
      {showEdit && currentUser && (
        <ProfileEditForm
          user={currentUser}
          onClose={() => setShowEdit(false)}
          onSave={handleSave}
        />
      )}
      <PageHero title="Mi Perfil" subtitle="Información registrada en tu cuenta" />

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {/* Section 1 — Datos personales */}
        <SectionCard title="Datos personales">
          <dl>
            <ProfileField label="Nombre completo" value={nombreCompleto} />
            <ProfileField label="Email" value={currentUser.email} />
            <ProfileField label="Teléfono" value={currentUser.telefono} />
            <ProfileField label="Redes sociales" value={currentUser.redesSociales as string} />
          </dl>
        </SectionCard>

        {/* Section 2 — Domicilio */}
        <SectionCard title="Domicilio">
          <dl>
            <ProfileField label="Calle" value={currentUser.calle} />
            <ProfileField label="Colonia" value={currentUser.colonia} />
            <ProfileField label="Código postal" value={currentUser.cp} />
            <ProfileField label="Municipio" value={currentUser.municipio} />
          </dl>
        </SectionCard>

        {/* Section 3 — Datos demográficos */}
        <SectionCard title="Datos demográficos">
          <dl>
            <ProfileField label="Género" value={formatGenero(currentUser.genero)} />
            <ProfileField label="Ocupación" value={currentUser.ocupacion} />
            <ProfileField label="Grado de estudios" value={formatGradoEstudios(currentUser.gradoEstudios)} />
            <ProfileField label="Escuela" value={currentUser.escuela} />
            <ProfileField label="Situación laboral" value={formatSituacionLaboral(currentUser.situacionLaboral)} />
          </dl>
        </SectionCard>

        {/* Section 4 — Mis eventos */}
        <SectionCard title="Mis eventos">
          {myAttendances.length === 0 ? (
            <p className="text-sm text-text-muted py-2">No tenés eventos confirmados aún.</p>
          ) : (
            <div className="space-y-3">
              {myAttendances.map(att => (
                <AttendanceQRCard key={att.id} attendance={att} />
              ))}
            </div>
          )}
        </SectionCard>

        <div className="flex flex-col sm:flex-row gap-3">
          <PrimaryButton onClick={() => setShowEdit(true)}>Editar perfil</PrimaryButton>
          <SecondaryButton onClick={handleLogout}>Cerrar sesión</SecondaryButton>
        </div>
      </div>
    </>
  );
}