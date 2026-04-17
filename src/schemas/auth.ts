import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password requerido'),
});

// Paso 1 — Datos personales (base, sin confirmPassword)
export const registerStep1Schema = z.object({
  apaterno: z.string().min(1, 'Apellido paterno requerido'),
  amaterno: z.string().min(1, 'Apellido materno requerido'),
  nombres: z.string().min(1, 'Nombres requeridos'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres').regex(/\d/, 'Debe contener al menos un número'),
  telefono: z.string().length(10, 'Debe tener 10 dígitos').regex(/^\d+$/, 'Solo números'),
  redesSociales: z.string().optional(),
});

// Schema del form de paso 1 (incluye confirmPassword para validación UI)
export const registerStep1FormSchema = registerStep1Schema
  .extend({
    confirmPassword: z.string().min(1, 'Confirmá tu contraseña'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

// Paso 2 — Dirección
export const registerStep2Schema = z.object({
  calle: z.string().min(1, 'Calle requerida'),
  colonia: z.string().min(1, 'Colonia requerida'),
  cp: z.string().length(5, 'Debe tener 5 dígitos').regex(/^\d+$/, 'Solo números'),
  municipio: z.string().min(1, 'Municipio requerido'),
});

// Paso 3 — Datos demográficos
export const registerStep3Schema = z.object({
  genero: z.enum(['MASCULINO', 'FEMENINO', 'OTRO', 'NO_DICE'] as const, {
    error: 'Selecciona una opción',
  }),
  ocupacion: z.string().min(1, 'Ocupación requerida'),
  gradoEstudios: z.enum(['PRIMARIA', 'SECUNDARIA', 'PREPARATORIA', 'LICENCIATURA', 'POSGRADO', 'OTRO'] as const, {
    error: 'Selecciona una opción',
  }),
  escuela: z.string().optional(),
  situacionLaboral: z.enum(['ESTUDIANTE', 'EMPLEADO', 'AUTOEMPLEADO', 'DESEMPLEADO', 'OTRO'] as const, {
    error: 'Selecciona una opción',
  }),
});

// Schema completo (unión de los 3 pasos)
export const registerSchema = registerStep1Schema
  .merge(registerStep2Schema)
  .merge(registerStep3Schema);

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterStep1Data = z.infer<typeof registerStep1FormSchema>;
export type RegisterStep2Data = z.infer<typeof registerStep2Schema>;
export type RegisterStep3Data = z.infer<typeof registerStep3Schema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// Schemas legacy (mantener para el profile que los usa)
export const profileSchema = z.object({
  name: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password actual requerido'),
  newPassword: z.string().min(8, 'Mínimo 8 caracteres').regex(/\d/, 'Al menos 1 número'),
});
