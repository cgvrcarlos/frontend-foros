'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  if (!user) return null;

  const isUser = 'nombres' in user;
  const isAdmin = 'role' in user && !isUser;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">Mi Perfil</h1>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Información de cuenta
          </h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-slate-500">Email</dt>
              <dd className="text-slate-900 font-medium">{user.email}</dd>
            </div>
            {isUser && (
              <>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Nombre completo</dt>
                  <dd className="text-slate-900 font-medium">
                    {(user as any).apaterno} {(user as any).amaterno}, {(user as any).nombres}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Teléfono</dt>
                  <dd className="text-slate-900">{(user as any).telefono}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Municipio</dt>
                  <dd className="text-slate-900">{(user as any).municipio}</dd>
                </div>
              </>
            )}
            {isAdmin && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Rol</dt>
                <dd>
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
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
  );
}
