'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 h-16 shadow-sm">
      <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="Foro Ciudadano" style={{backgroundColor:'rgb(7,58,56)'}} width={82} height={32} className="shrink-0" />
          <span className="text-lg font-bold tracking-tight" style={{ color: '#063a3a' }}>
            Foro Ciudadano
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/eventos"
            className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Eventos
          </Link>

          {user ? (
            <>
              {user.roles?.includes('ADMIN') && (
                <Link
                  href="/admin"
                  className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Admin
                </Link>
              )}
              {user.roles?.includes('PONENTE') && (
                <Link
                  href="/ponente"
                  className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Mi panel
                </Link>
              )}
              <span className="hidden sm:block text-sm text-slate-500 px-2">
                {user.nombres || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Ingresar
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors hover:opacity-90"
                style={{ background: '#063a3a' }}
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
