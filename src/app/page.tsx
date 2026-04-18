'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import type { Evento } from '@/types/api';

function EventCard({ evento }: { evento: Evento }) {
  const fecha = new Date(evento.fechaHora);
  const fechaStr = fecha.toLocaleDateString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  });
  const hora = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  const esVirtual = !!evento.linkVirtual;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-900 leading-snug">{evento.titulo}</h3>
        <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${
          esVirtual
            ? 'bg-violet-50 text-violet-600 border border-violet-100'
            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
        }`}>
          {esVirtual ? 'Virtual' : 'Presencial'}
        </span>
      </div>

      {evento.descripcion && (
        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{evento.descripcion}</p>
      )}

      <div className="flex items-center gap-2 text-sm text-slate-500 mt-auto">
        <svg className="w-4 h-4 shrink-0 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="capitalize">{fechaStr} · {hora}</span>
      </div>

      <Link
        href={`/eventos/${evento.id}`}
        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-800 transition-colors"
      >
        Ver detalle
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

export default function Home() {
  const [eventos, setEventos] = useState<Evento[]>([]);

  useEffect(() => {
    api.get<Evento[]>('/eventos')
      .then(res => setEventos(res.data.slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden flex items-center justify-center min-h-[calc(100vh-4rem)]"
        style={{ background: 'linear-gradient(135deg, #063a3a 0%, #0a5252 55%, #1a2f5a 100%)' }}
      >
        {/* Decorative papiros */}
        <div className="pointer-events-none absolute inset-0 select-none">
          <Image
            src="/papiro2.svg"
            alt=""
            width={320}
            height={320}
            className="absolute -left-16 top-1/4 opacity-[0.12] rotate-12"
          />
          <Image
            src="/papiro2.svg"
            alt=""
            width={280}
            height={280}
            className="absolute -right-12 bottom-1/4 opacity-[0.10] -rotate-12"
          />
          <Image
            src="/papiro3.svg"
            alt=""
            width={200}
            height={200}
            className="absolute left-1/4 -bottom-8 opacity-[0.08]"
          />
        </div>

        <div className="relative z-10 text-center px-4 py-20 max-w-3xl mx-auto">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Image
              src="/logo.svg"
              alt="Foro Ciudadano"
              width={300}
              height={300}
              className="drop-shadow-lg"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#D8934A] animate-pulse" />
            Participación ciudadana activa
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Foro<br />
            <span style={{ color: '#D8934A' }}>Ciudadano</span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 leading-relaxed mb-10 max-w-xl mx-auto">
            Regístrese, asista a eventos y haga escuchar su voz a través de encuestas y propuestas comunitarias.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/eventos"
              className="px-8 py-4 rounded-xl font-semibold text-white transition-all text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              style={{ background: '#D8934A' }}
            >
              Ver Eventos
            </Link>
            <Link
              href="/auth/register"
              className="px-8 py-4 rounded-xl bg-white/10 border border-white/30 text-white font-semibold hover:bg-white/20 transition-all text-base backdrop-blur-sm hover:-translate-y-0.5"
            >
              Registrarse
            </Link>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 inset-x-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
            <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* ── Próximos Eventos ─────────────────────────────────────────────── */}
      <section className="bg-slate-50 px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Próximos Eventos</h2>
              <p className="text-slate-500 mt-1">Encuentra el que te interesa y confirmá tu asistencia</p>
            </div>
            <Link
              href="/eventos"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-800 transition-colors"
            >
              Ver todos
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {eventos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {eventos.map(e => <EventCard key={e.id} evento={e} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="font-medium">No hay eventos publicados aún</p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link href="/eventos" className="text-sm font-semibold text-teal-600 hover:underline">
              Ver todos los eventos →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">¿Cómo funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: '#D8934A20' }}>
                <svg className="w-7 h-7" style={{ color: '#D8934A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 text-lg mb-2">1. Regístrese</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Creá tu cuenta en minutos completando tus datos como ciudadano.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-teal-50">
                <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 text-lg mb-2">2. Confirmá asistencia</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Elige el evento, elige presencial o virtual, y obt&eacute;n tu QR de acceso único.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-violet-50">
                <svg className="w-7 h-7 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 text-lg mb-2">3. Participá</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Completa encuestas y dejá tus propuestas para contribuir a mejorar la comunidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden px-4 py-24 text-center"
        style={{ background: 'linear-gradient(135deg, #063a3a 0%, #0a5252 100%)' }}
      >
        <div className="pointer-events-none absolute inset-0 select-none">
          <Image
            src="/papiro2.svg"
            alt=""
            width={220}
            height={220}
            className="absolute -left-8 -bottom-8 opacity-[0.12]"
          />
          <Image
            src="/papiro2.svg"
            alt=""
            width={180}
            height={180}
            className="absolute -right-4 -top-4 opacity-[0.10] rotate-45"
          />
        </div>
        <div className="relative z-10 max-w-xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4">Tu voz importa</h2>
          <p className="text-white/70 text-lg mb-10 leading-relaxed">
            Regístrese gratuitamente y comience a participar en los eventos ciudadanos de su comunidad.
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-10 py-4 rounded-xl font-bold text-white text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            style={{ background: '#D8934A' }}
          >
            Crear cuenta gratis
          </Link>
        </div>
      </section>

    </div>
  );
}
