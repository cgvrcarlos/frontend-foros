'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/schemas/auth';
import { z } from 'zod';

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} role="form">
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
        <input {...register('email')} id="email" type="email"
          className="w-full border p-2 rounded" />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <div className="mb-6">
        <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
        <input {...register('password')} id="password" type="password"
          className="w-full border p-2 rounded" />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}
        className="w-full bg-[#4A90D9] text-white p-3 rounded font-medium hover:opacity-90">
        {isSubmitting ? 'Iniciando...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
}