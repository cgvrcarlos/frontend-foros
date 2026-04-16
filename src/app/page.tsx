import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-24 md:py-36">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
            Participación ciudadana
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight tracking-tight mb-6">
            EventPass
          </h1>
          <p className="text-lg md:text-xl text-slate-500 leading-relaxed mb-10 max-w-xl mx-auto">
            Registrate, asistí a eventos ciudadanos y hacé escuchar tu voz a través de encuestas y propuestas comunitarias.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/eventos"
              className="px-6 py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors text-center"
            >
              Ver Eventos
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-3 rounded-lg bg-white text-slate-700 font-medium border border-slate-200 hover:bg-slate-50 transition-colors text-center"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto w-full px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Eventos ciudadanos</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Accedé al calendario de eventos presenciales y virtuales de tu comunidad.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Confirmación con QR</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Confirmá tu asistencia y obtené tu código QR único para acceso rápido.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Encuestas y propuestas</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Completá encuestas por evento y contribuí con propuestas de mejora comunitaria.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
