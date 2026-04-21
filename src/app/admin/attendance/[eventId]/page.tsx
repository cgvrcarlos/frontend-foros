'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatCard } from '@/components/ui/StatCard';
import { AttendanceStatusChart } from '@/components/admin/attendance/AttendanceStatusChart';
import { AttendanceTypeChart } from '@/components/admin/attendance/AttendanceTypeChart';
import { CheckInTimelineChart } from '@/components/admin/attendance/CheckInTimelineChart';
import api from '@/lib/api';
import type { AttendanceStatus, EventStats } from '@/types/api';

interface AttendanceItem {
  id: string;
  qrCode: string;
  status: AttendanceStatus;
  tipoAsistencia: 'PRESENCIAL' | 'VIRTUAL';
  confirmedAt: string;
  verifiedAt: string | null;
  user: {
    nombres: string;
    apaterno: string | null;
    email: string;
  };
}

interface EventInfo {
  id: string;
  titulo: string;
  fechaHora: string;
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

export default function AttendancePanelPage() {
  const params = useParams<{ eventId: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [evento, setEvento] = useState<EventInfo | null>(null);
  const [attendances, setAttendances] = useState<AttendanceItem[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || (!user.roles.includes('ADMIN') && !user.roles.includes('STAFF')))) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!params.eventId) return;
    Promise.all([
      api.get<EventInfo>(`/eventos/${params.eventId}`),
      api.get<AttendanceItem[]>(`/attendance/event/${params.eventId}`),
      api.get<EventStats>(`/stats/event/${params.eventId}`),
    ])
      .then(([evRes, attRes, statsRes]) => {
        setEvento(evRes.data);
        setAttendances(attRes.data);
        setStats(statsRes.data);
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [params.eventId]);

  if (loading || loadingData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/2" />
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="h-24 bg-slate-200 rounded-xl" />
            <div className="h-24 bg-slate-200 rounded-xl" />
            <div className="h-24 bg-slate-200 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-slate-200 rounded-xl" />
            <div className="h-24 bg-slate-200 rounded-xl" />
          </div>
          <div className="h-64 bg-slate-200 rounded-xl" />
          <div className="h-64 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{evento?.titulo ?? 'Asistencias'}</h1>
          {evento && (
            <p className="text-sm text-text-muted mt-1">
              {new Date(evento.fechaHora).toLocaleDateString('es-MX', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          )}
        </div>
        <Link
          href={`/admin/attendance/${params.eventId}/scan`}
          className="shrink-0 px-4 py-2 rounded-lg bg-teal-accent text-white text-sm font-medium hover:brightness-95 transition"
        >
          Iniciar scanner
        </Link>
      </div>

      {stats?.totalConfirmados === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">Sin asistencias registradas para este evento.</p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard
              label="Total confirmados"
              value={stats?.totalConfirmados ?? 0}
              tone="neutral"
            />
            <StatCard
              label="Asistieron"
              value={stats?.asistioCount ?? 0}
              tone="success"
              hint={stats && stats.totalConfirmados > 0
                ? `${Math.round(stats.tasaAsistencia * 100)}% tasa de asistencia`
                : undefined}
            />
            <StatCard
              label="No asistieron"
              value={stats?.noAsistioCount ?? 0}
              tone="danger"
            />
            <StatCard
              label="Pendientes"
              value={stats?.confirmadoPendiente ?? 0}
              tone="warning"
            />
            <StatCard
              label="Respuestas"
              value={stats?.totalRespuestas ?? 0}
              tone="info"
            />
          </div>

          {/* Charts */}
          <SectionCard title="Resumen de asistencia">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Estado</p>
                <AttendanceStatusChart
                  asistioCount={stats?.asistioCount ?? 0}
                  noAsistioCount={stats?.noAsistioCount ?? 0}
                  confirmadoPendiente={stats?.confirmadoPendiente ?? 0}
                />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Modalidad</p>
                <AttendanceTypeChart
                  confirmadosPresenciales={stats?.confirmadosPresenciales ?? 0}
                  confirmadosVirtuales={stats?.confirmadosVirtuales ?? 0}
                />
              </div>
              <div className="sm:col-span-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Check-ins por hora</p>
                <CheckInTimelineChart data={stats?.verifiedTimeline ?? []} />
              </div>
            </div>
          </SectionCard>
        </>
      )}

      {/* Lista */}
      <SectionCard title="Registro de asistencias">
        {attendances.length === 0 ? (
          <p className="text-sm text-text-muted">Sin asistencias registradas.</p>
        ) : (
          <div className="divide-y divide-border">
            {attendances.map(att => (
              <div key={att.id} className="flex items-center justify-between py-3 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {att.user.nombres} {att.user.apaterno ?? ''}
                  </p>
                  <p className="text-xs text-text-muted">{att.user.email}</p>
                  {att.verifiedAt && (
                    <p className="text-xs text-text-muted">
                      Verificado:{' '}
                      {new Date(att.verifiedAt).toLocaleTimeString('es-MX', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
                <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[att.status]}`}>
                  {STATUS_LABEL[att.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
