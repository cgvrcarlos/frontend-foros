import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema, profileSchema, changePasswordSchema } from './auth';

// Datos válidos completos para el nuevo schema de registro
const validRegisterData = {
  apaterno: 'García',
  amaterno: 'López',
  nombres: 'Juan Carlos',
  email: 'test@test.com',
  password: 'Password1',
  telefono: '5512345678',
  redesSociales: undefined,
  calle: 'Av. Principal 123',
  colonia: 'Centro',
  cp: '12345',
  municipio: 'CDMX',
  genero: 'MASCULINO' as const,
  ocupacion: 'Docente',
  gradoEstudios: 'LICENCIATURA' as const,
  escuela: undefined,
  situacionLaboral: 'EMPLEADO' as const,
};

describe('registerSchema', () => {
  it('validates correct complete data', () => {
    const result = registerSchema.safeParse(validRegisterData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({ ...validRegisterData, email: 'not-email' });
    expect(result.success).toBe(false);
  });

  it('rejects telefono with wrong length', () => {
    const result = registerSchema.safeParse({ ...validRegisterData, telefono: '123' });
    expect(result.success).toBe(false);
  });

  it('rejects cp with wrong length', () => {
    const result = registerSchema.safeParse({ ...validRegisterData, cp: '123' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid genero', () => {
    const result = registerSchema.safeParse({ ...validRegisterData, genero: 'INVALID' });
    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const result = registerSchema.safeParse({ email: 'test@test.com' });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('validates correct credentials', () => {
    const data = { email: 'test@test.com', password: 'password123' };
    const result = loginSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('rejects empty password', () => {
    const data = { email: 'test@test.com', password: '' };
    const result = loginSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const data = { email: 'not-email', password: 'pass' };
    const result = loginSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe('profileSchema', () => {
  it('validates optional name', () => {
    const result = profileSchema.safeParse({ name: undefined });
    expect(result.success).toBe(true);

    const result2 = profileSchema.safeParse({ name: 'New Name' });
    expect(result2.success).toBe(true);
  });
});

describe('changePasswordSchema', () => {
  it('validates correct data', () => {
    const data = {
      currentPassword: 'oldpassword',
      newPassword: 'newpassword123',
    };
    const result = changePasswordSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('rejects weak new password', () => {
    const data = {
      currentPassword: 'oldpassword',
      newPassword: 'weak',
    };
    const result = changePasswordSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
