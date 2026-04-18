'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/schemas/auth';
import { useAuth } from '@/components/auth/AuthProvider';
import Image from 'next/image';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    try {
      const user = await login(data.email, data.password);
      
      // Redirigir según role del usuario retornado
      if (user.role === 'ADMIN') {
        router.replace('/admin');
      } else if (user.role === 'PONENTE') {
        router.replace('/ponente');
      } else {
        router.replace('/eventos');
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Credenciales inválidas. Verificá tu email y contraseña.');
    }
  };

  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(135deg, #063a3a 0%, #0a5252 55%, #1a2f5a 100%)' }}>
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
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Ingresar</h1>
            <p className="text-sm text-slate-500">
              Acceso para administradores y ponentes.
            </p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Contraseña
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Sos ciudadano?{' '}
            <Link href="/auth/register" className="text-blue-500 font-medium hover:underline">
              Registrate acá
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
