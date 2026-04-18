'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  registerStep1FormSchema,
  registerStep2Schema,
  registerStep3Schema,
  type RegisterStep1Data,
  type RegisterStep2Data,
  type RegisterStep3Data,
  type RegisterFormData,
} from '@/schemas/auth';
import { useAuth } from '@/components/auth/AuthProvider';
import Image from 'next/image';

// ─── Step indicators ─────────────────────────────────────────────────────────

const STEPS = ['Datos personales', 'Dirección', 'Perfil'];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center gap-2 flex-1 last:flex-none">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                i < current
                  ? 'bg-blue-500 text-white'
                  : i === current
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {i < current ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-xs font-medium hidden sm:block ${
                i === current ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mx-2 ${i < current ? 'bg-blue-300' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Field helpers ────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputClass =
  'w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow';

const selectClass =
  'w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow';

// ─── Step 1 ───────────────────────────────────────────────────────────────────

function Step1({
  onNext,
  defaultValues,
}: {
  onNext: (data: RegisterStep1Data) => void;
  defaultValues?: Partial<RegisterStep1Data>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterStep1Data>({
    resolver: zodResolver(registerStep1FormSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Apellido paterno" error={errors.apaterno?.message}>
          <input {...register('apaterno')} className={inputClass} placeholder="García" />
        </Field>
        <Field label="Apellido materno" error={errors.amaterno?.message}>
          <input {...register('amaterno')} className={inputClass} placeholder="López" />
        </Field>
      </div>

      <Field label="Nombres" error={errors.nombres?.message}>
        <input {...register('nombres')} className={inputClass} placeholder="Juan Carlos" />
      </Field>

      <Field label="Email" error={errors.email?.message}>
        <input
          {...register('email')}
          type="email"
          autoComplete="email"
          className={inputClass}
          placeholder="juan@email.com"
        />
      </Field>

      <Field label="Contraseña" error={errors.password?.message}>
        <input
          {...register('password')}
          type="password"
          autoComplete="new-password"
          className={inputClass}
          placeholder="Mínimo 8 caracteres con al menos un número"
        />
      </Field>

      <Field label="Confirmar contraseña" error={errors.confirmPassword?.message}>
        <input
          {...register('confirmPassword')}
          type="password"
          autoComplete="new-password"
          className={inputClass}
          placeholder="Repetí tu contraseña"
        />
      </Field>

      <Field label="Teléfono (10 dígitos)" error={errors.telefono?.message}>
        <input
          {...register('telefono')}
          type="tel"
          inputMode="numeric"
          maxLength={10}
          className={inputClass}
          placeholder="5512345678"
        />
      </Field>

      <Field label="Redes sociales (opcional)" error={errors.redesSociales?.message}>
        <input
          {...register('redesSociales')}
          className={inputClass}
          placeholder="@usuario o perfil de Facebook"
        />
      </Field>

      <button
        type="submit"
        className="w-full py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors mt-2"
      >
        Continuar
      </button>
    </form>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

function Step2({
  onNext,
  onBack,
  defaultValues,
}: {
  onNext: (data: RegisterStep2Data) => void;
  onBack: () => void;
  defaultValues?: Partial<RegisterStep2Data>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterStep2Data>({
    resolver: zodResolver(registerStep2Schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <Field label="Calle y número" error={errors.calle?.message}>
        <input {...register('calle')} className={inputClass} placeholder="Av. Principal 123" />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Colonia" error={errors.colonia?.message}>
          <input {...register('colonia')} className={inputClass} placeholder="Centro" />
        </Field>
        <Field label="Código postal" error={errors.cp?.message}>
          <input
            {...register('cp')}
            inputMode="numeric"
            maxLength={5}
            className={inputClass}
            placeholder="12345"
          />
        </Field>
      </div>

      <Field label="Municipio" error={errors.municipio?.message}>
        <input {...register('municipio')} className={inputClass} placeholder="Ciudad de México" />
      </Field>

      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
        >
          Atrás
        </button>
        <button
          type="submit"
          className="flex-1 py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
        >
          Continuar
        </button>
      </div>
    </form>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

function Step3({
  onSubmit: onFormSubmit,
  onBack,
  isSubmitting,
  error,
  defaultValues,
}: {
  onSubmit: (data: RegisterStep3Data) => void;
  onBack: () => void;
  isSubmitting: boolean;
  error: string;
  defaultValues?: Partial<RegisterStep3Data>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterStep3Data>({
    resolver: zodResolver(registerStep3Schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <Field label="Género" error={errors.genero?.message}>
        <select {...register('genero')} className={selectClass} defaultValue="">
          <option value="" disabled>Seleccioná una opción</option>
          <option value="MASCULINO">Masculino</option>
          <option value="FEMENINO">Femenino</option>
          <option value="OTRO">Otro</option>
          <option value="NO_DICE">Prefiero no decir</option>
        </select>
      </Field>

      <Field label="Ocupación" error={errors.ocupacion?.message}>
        <input {...register('ocupacion')} className={inputClass} placeholder="Ej: Docente, Comerciante..." />
      </Field>

      <Field label="Grado de estudios" error={errors.gradoEstudios?.message}>
        <select {...register('gradoEstudios')} className={selectClass} defaultValue="">
          <option value="" disabled>Seleccioná una opción</option>
          <option value="PRIMARIA">Primaria</option>
          <option value="SECUNDARIA">Secundaria</option>
          <option value="PREPARATORIA">Preparatoria</option>
          <option value="LICENCIATURA">Licenciatura</option>
          <option value="POSGRADO">Posgrado</option>
          <option value="OTRO">Otro</option>
        </select>
      </Field>

      <Field label="Escuela (opcional)" error={errors.escuela?.message}>
        <input {...register('escuela')} className={inputClass} placeholder="Nombre de tu institución" />
      </Field>

      <Field label="Situación laboral" error={errors.situacionLaboral?.message}>
        <select {...register('situacionLaboral')} className={selectClass} defaultValue="">
          <option value="" disabled>Seleccioná una opción</option>
          <option value="ESTUDIANTE">Estudiante</option>
          <option value="EMPLEADO">Empleado</option>
          <option value="AUTOEMPLEADO">Autoempleado</option>
          <option value="DESEMPLEADO">Desempleado</option>
          <option value="OTRO">Otro</option>
        </select>
      </Field>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 py-3 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-60 transition-colors"
        >
          Atrás
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Registrando...' : 'Registrarse'}
        </button>
      </div>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<RegisterFormData>>({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStep1 = ({ confirmPassword: _cp, ...rest }: RegisterStep1Data) => {
    setFormData((prev) => ({ ...prev, ...rest }));
    setStep(1);
  };

  const handleStep2 = (data: RegisterStep2Data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleStep3 = async (data: RegisterStep3Data) => {
    const fullData = { ...formData, ...data } as RegisterFormData;
    setIsSubmitting(true);
    setError('');
    try {
      await registerUser(fullData);
      router.replace('/eventos');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string | string[] } } };
      const msg = axiosError.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join('. ') : (msg || 'Error al registrar. Intentá nuevamente.'));
    } finally {
      setIsSubmitting(false);
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
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Crear cuenta</h1>
            <p className="text-sm text-slate-500">Completá los datos para registrarte como ciudadano.</p>
          </div>

          <StepIndicator current={step} />

          {step === 0 && (
            <Step1 onNext={handleStep1} defaultValues={formData as Partial<RegisterStep1Data>} />
          )}
          {step === 1 && (
            <Step2
              onNext={handleStep2}
              onBack={() => setStep(0)}
              defaultValues={formData as Partial<RegisterStep2Data>}
            />
          )}
          {step === 2 && (
            <Step3
              onSubmit={handleStep3}
              onBack={() => setStep(1)}
              isSubmitting={isSubmitting}
              error={error}
              defaultValues={formData as Partial<RegisterStep3Data>}
            />
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Ya tenés cuenta?{' '}
            <Link href="/auth/login" className="text-blue-500 font-medium hover:underline">
              Ingresá acá
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
