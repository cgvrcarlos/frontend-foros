'use client';
import { useState, useEffect } from 'react';
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
import { AuthLayout } from '@/components/ui/AuthLayout';
import { FormField, formInputClass } from '@/components/ui/FormField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';

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
                i <= current
                  ? 'bg-teal-accent text-white'
                  : 'bg-bg-light text-text-muted'
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
                i === current ? 'text-text-primary' : 'text-text-muted'
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mx-2 ${i < current ? 'bg-teal-accent/40' : 'bg-border'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Shared input class for selects ──────────────────────────────────────────

const selectClass =
  'w-full px-3 py-2.5 rounded-lg border border-border text-text-primary bg-surface ' +
  'focus:outline-none focus:ring-2 focus:ring-teal-accent focus:border-transparent transition';

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
        <FormField label="Apellido paterno" error={errors.apaterno?.message}>
          <input {...register('apaterno')} className={formInputClass} placeholder="García" />
        </FormField>
        <FormField label="Apellido materno" error={errors.amaterno?.message}>
          <input {...register('amaterno')} className={formInputClass} placeholder="López" />
        </FormField>
      </div>

      <FormField label="Nombres" error={errors.nombres?.message}>
        <input {...register('nombres')} className={formInputClass} placeholder="Juan Carlos" />
      </FormField>

      <FormField label="Email" error={errors.email?.message}>
        <input
          {...register('email')}
          type="email"
          autoComplete="email"
          className={formInputClass}
          placeholder="juan@email.com"
        />
      </FormField>

      <FormField label="Contraseña" error={errors.password?.message}>
        <input
          {...register('password')}
          type="password"
          autoComplete="new-password"
          className={formInputClass}
          placeholder="Mínimo 8 caracteres con al menos un número"
        />
      </FormField>

      <FormField label="Confirmar contraseña" error={errors.confirmPassword?.message}>
        <input
          {...register('confirmPassword')}
          type="password"
          autoComplete="new-password"
          className={formInputClass}
          placeholder="Repita su contraseña"
        />
      </FormField>

      <FormField label="Teléfono (10 dígitos)" error={errors.telefono?.message}>
        <input
          {...register('telefono')}
          type="tel"
          inputMode="numeric"
          maxLength={10}
          className={formInputClass}
          placeholder="5512345678"
        />
      </FormField>

      <FormField label="Redes sociales (opcional)" error={errors.redesSociales?.message}>
        <input
          {...register('redesSociales')}
          className={formInputClass}
          placeholder="@usuario o perfil de Facebook"
        />
      </FormField>

      <PrimaryButton type="submit" className="w-full mt-2">
        Continuar
      </PrimaryButton>
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
      <FormField label="Calle y número" error={errors.calle?.message}>
        <input {...register('calle')} className={formInputClass} placeholder="Av. Principal 123" />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Colonia" error={errors.colonia?.message}>
          <input {...register('colonia')} className={formInputClass} placeholder="Centro" />
        </FormField>
        <FormField label="Código postal" error={errors.cp?.message}>
          <input
            {...register('cp')}
            inputMode="numeric"
            maxLength={5}
            className={formInputClass}
            placeholder="12345"
          />
        </FormField>
      </div>

      <FormField label="Municipio" error={errors.municipio?.message}>
        <input {...register('municipio')} className={formInputClass} placeholder="Ciudad de México" />
      </FormField>

      <div className="flex gap-3 mt-2">
        <SecondaryButton type="button" onClick={onBack} className="flex-1">
          Atrás
        </SecondaryButton>
        <PrimaryButton type="submit" className="flex-1">
          Continuar
        </PrimaryButton>
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
      <FormField label="Género" error={errors.genero?.message}>
        <select {...register('genero')} className={selectClass} defaultValue="">
          <option value="" disabled>Seleccione una opción</option>
          <option value="MASCULINO">Masculino</option>
          <option value="FEMENINO">Femenino</option>
          <option value="OTRO">Otro</option>
          <option value="NO_DICE">Prefiero no decir</option>
        </select>
      </FormField>

      <FormField label="Ocupación" error={errors.ocupacion?.message}>
        <input {...register('ocupacion')} className={formInputClass} placeholder="Ej: Docente, Comerciante..." />
      </FormField>

      <FormField label="Grado de estudios" error={errors.gradoEstudios?.message}>
        <select {...register('gradoEstudios')} className={selectClass} defaultValue="">
          <option value="" disabled>Seleccione una opción</option>
          <option value="PRIMARIA">Primaria</option>
          <option value="SECUNDARIA">Secundaria</option>
          <option value="PREPARATORIA">Preparatoria</option>
          <option value="LICENCIATURA">Licenciatura</option>
          <option value="POSGRADO">Posgrado</option>
          <option value="OTRO">Otro</option>
        </select>
      </FormField>

      <FormField label="Escuela (opcional)" error={errors.escuela?.message}>
        <input {...register('escuela')} className={formInputClass} placeholder="Nombre de su institución" />
      </FormField>

      <FormField label="Situación laboral" error={errors.situacionLaboral?.message}>
        <select {...register('situacionLaboral')} className={selectClass} defaultValue="">
          <option value="" disabled>Seleccione una opción</option>
          <option value="ESTUDIANTE">Estudiante</option>
          <option value="EMPLEADO">Empleado</option>
          <option value="AUTOEMPLEADO">Autoempleado</option>
          <option value="DESEMPLEADO">Desempleado</option>
          <option value="OTRO">Otro</option>
        </select>
      </FormField>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-300 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 mt-2">
        <SecondaryButton type="button" onClick={onBack} disabled={isSubmitting} className="flex-1">
          Atrás
        </SecondaryButton>
        <PrimaryButton type="submit" size="lg" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Registrando...' : 'Registrarse'}
        </PrimaryButton>
      </div>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const { register: registerUser, user, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (loading || !user) return;
    if (user.roles?.includes('ADMIN')) router.replace('/admin');
    else if (user.roles?.includes('PONENTE')) router.replace('/ponente');
    else if (user.roles?.includes('STAFF')) router.replace('/staff');
    else router.replace('/eventos');
  }, [user, loading, router]);
  const [formData, setFormData] = useState<Partial<RegisterFormData>>({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStep1 = ({ confirmPassword: _cp, ...rest }: RegisterStep1Data) => {
    setFormData(prev => ({ ...prev, ...rest }));
    setStep(1);
  };

  const handleStep2 = (data: RegisterStep2Data) => {
    setFormData(prev => ({ ...prev, ...data }));
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
      setError(
        Array.isArray(msg) ? msg.join('. ') : msg || 'Error al registrar. Intente nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <>
      ¿Ya tiene cuenta?{' '}
      <Link href="/auth/login" className="text-teal-soft font-medium hover:underline">
        Inicie sesión
      </Link>
    </>
  );

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Complete el formulario para registrarse."
      size="lg"
      footer={footer}
    >
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
    </AuthLayout>
  );
}
