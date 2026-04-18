'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/components/auth/AuthProvider';

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div
        className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex items-center justify-center"
        style={{
          background:
            'linear-gradient(135deg, #063a3a 0%, #0a5252 55%, #1a2f5a 100%)',
        }}
      >
        <div className="pointer-events-none absolute inset-0 select-none">
          <Image src="/papiro2.svg" alt="" width={320} height={320} className="absolute -left-16 top-1/4 opacity-[0.12] rotate-12" />
          <Image src="/papiro2.svg" alt="" width={280} height={280} className="absolute -right-12 bottom-1/4 opacity-[0.10] -rotate-12" />
          <Image src="/papiro3.svg" alt="" width={200} height={200} className="absolute left-1/4 -bottom-8 opacity-[0.08]" />
        </div>
        <div className="relative z-10 text-white/60">Cargando...</div>
      </div>
    );
  }

  if (!user) return null;

  const isUser = 'nombres' in user;
  const isAdmin = 'role' in user && !isUser;

  return (
    <div
      className="relative overflow-hidden min-h-[calc(100vh-4rem)]"
      style={{
        background:
          'linear-gradient(135deg, #063a3a 0%, #0a5252 55%, #1a2f5a 100%)',
      }}
    >
 
      <div className="pointer-events-none absolute inset-0 select-none">
        <Image src="/papiro2.svg" alt="" width={320} height={320} className="absolute -left-16 top-1/4 opacity-[0.12] rotate-12" />
        <Image src="/papiro2.svg" alt="" width={280} height={280} className="absolute -right-12 bottom-1/4 opacity-[0.10] -rotate-12" />
        <Image src="/papiro3.svg" alt="" width={200} height={200} className="absolute left-1/4 -bottom-8 opacity-[0.08]" />
      </div>

      <div className="relative z-10 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-8">Mi Perfil</h1>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 mb-6">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">
              Información de cuenta
            </h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-white/60">Email</dt>
                <dd className="text-white font-medium">{user.email}</dd>
              </div>

              {isUser && (
                <>
                  <div className="flex justify-between">
                    <dt className="text-white/60">Nombre completo</dt>
                    <dd className="text-white font-medium">
                      {(user as any).apaterno} {(user as any).amaterno},{' '}
                      {(user as any).nombres}
                    </dd>
                  </div>

                  <div className="flex justify-between">
                    <dt className="text-white/60">Teléfono</dt>
                    <dd className="text-white">
                      {(user as any).telefono}
                    </dd>
                  </div>

                  <div className="flex justify-between">
                    <dt className="text-white/60">Municipio</dt>
                    <dd className="text-white">
                      {(user as any).municipio}
                    </dd>
                  </div>
                </>
              )}

              {isAdmin && (
                <div className="flex justify-between">
                  <dt className="text-white/60">Rol</dt>
                  <dd>
                    <span className="bg-blue-500/20 text-blue-300 text-xs font-semibold px-2 py-1 rounded-full">
                      {(user as any).role}
                    </span>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div> 
  );
}
