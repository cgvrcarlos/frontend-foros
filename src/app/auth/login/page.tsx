'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/schemas/auth';
import { useAuth } from '@/components/auth/AuthProvider';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { FormField, formInputClass } from '@/components/ui/FormField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

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

      if (user.roles?.includes('ADMIN')) {
        router.replace('/admin');
      } else if (user.roles?.includes('PONENTE')) {
        router.replace('/ponente');
      } else {
        router.replace('/eventos');
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(
        axiosError.response?.data?.message ||
          'Credenciales inválidas. Verifique su email y contraseña.'
      );
    }
  };

  const footer = (
    <>
      ¿No tiene cuenta?{' '}
      <Link href="/auth/register" className="text-teal-soft font-medium hover:underline">
        Regístrese aquí
      </Link>
    </>
  );

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Acceso para administradores, ponentes y ciudadanos."
      footer={footer}
    >
      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-300 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField label="Email" error={errors.email?.message}>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            className={formInputClass}
          />
        </FormField>

        <FormField label="Contraseña" error={errors.password?.message}>
          <input
            {...register('password')}
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className={formInputClass}
          />
        </FormField>

        <PrimaryButton type="submit" size="lg" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
        </PrimaryButton>
      </form>
    </AuthLayout>
  );
}
