'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import api from '@/lib/api';
import type { Evento } from '@/types/api';

export default function StaffPage() {
  const { loading } = useAuth();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loadingEventos, setLoadingEventos] = useState(true);

  useEffect(() => {
    api.get<Evento[]>('/eventos/all')
      .then(res => {
        setEventos(res.data.filter(e => !e.eliminado));
      })
      .catch(() => setEventos([]))
      .finally(() => setLoadingEventos(false));
  }, []);

  if (loading) return null;

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Panel de Staff</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Seleccioná un evento para escanear los QR de asistentes.
          </p>
        </div>

        {loadingEventos && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse h-20 bg-white rounded-xl border border-slate-100" />
            ))}
          </div>
        )}

        {!loadingEventos && eventos.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <p className="text-slate-400 text-sm">No hay eventos disponibles.</p>
          </div>
        )}

        {!loadingEventos && eventos.length > 0 && (
          <ul className="space-y-3">
            {eventos.map(evento => {
              const fecha = new Date(evento.fechaHora);
              const fechaStr = fecha.toLocaleDateString('es-MX', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              });
              const hora = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

              return (
                <li key={evento.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{evento.titulo}</p>
                    <p className="text-xs text-slate-400 mt-0.5 capitalize">{fechaStr} · {hora}</p>
                    {evento.ubicacionPresencial && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{evento.ubicacionPresencial}</p>
                    )}
                  </div>
                  <Link
                    href={`/admin/attendance/${evento.id}/scan`}
                    className="shrink-0 px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-colors whitespace-nowrap"
                    style={{ background: '#063a3a' }}
                  >
                    Escanear QR
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
