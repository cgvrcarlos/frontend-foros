'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schema local para el componente de registro simple (usado en tests)
const registerFormSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres').regex(/\d/, 'Al menos 1 número'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords no coinciden',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
}

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} role="form">
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
        <input {...register('email')} id="email" type="email"
          className="w-full border p-2 rounded" />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
        <input {...register('password')} id="password" type="password"
          className="w-full border p-2 rounded" />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
      </div>

      <div className="mb-6">
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirmar Password</label>
        <input {...register('confirmPassword')} id="confirmPassword" type="password"
          className="w-full border p-2 rounded" />
        {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}
        className="w-full bg-[#4A90D9] text-white p-3 rounded font-medium hover:opacity-90">
        {isSubmitting ? 'Registrando...' : 'Registrarse'}
      </button>
    </form>
  );
}
