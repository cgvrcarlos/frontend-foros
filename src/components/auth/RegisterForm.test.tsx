import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegisterForm } from './RegisterForm';

describe('RegisterForm', () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields', () => {
    render(<RegisterForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar password/i)).toBeInTheDocument();
  });

  it('shows validation errors for invalid email', async () => {
    render(<RegisterForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirmar password/i), { target: { value: 'password123' } });
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for weak password', async () => {
    render(<RegisterForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'weak' } });
    fireEvent.change(screen.getByLabelText(/confirmar password/i), { target: { value: 'weak' } });
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(screen.getByText(/mínimo 8 caracteres/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for password mismatch', async () => {
    render(<RegisterForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirmar password/i), { target: { value: 'different' } });
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(screen.getByText(/no coinciden/i)).toBeInTheDocument();
    });
  });

  it('calls onSubmit with valid data', async () => {
    render(<RegisterForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirmar password/i), { target: { value: 'password123' } });
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      const firstCall = mockOnSubmit.mock.calls[0];
      expect(firstCall[0]).toEqual({
        email: 'test@test.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
    });
  });
});