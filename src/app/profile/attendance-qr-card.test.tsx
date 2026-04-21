import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// Mock AuthProvider
vi.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'test@test.com', roles: ['ASISTENTE'], nombres: 'Juan', apaterno: 'Perez', amaterno: '' },
    loading: false,
    logout: vi.fn(),
  }),
}));

// Mock api
vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

// Mock qrcode.react
vi.mock('qrcode.react', () => ({
  QRCodeCanvas: ({ value }: { value: string }) => <canvas data-testid="qr-canvas" data-value={value} />,
}));

import api from '@/lib/api';
import ProfilePage from './page';

const makeAttendance = (overrides = {}) => ({
  id: 'att-1',
  qrCode: 'test-qr-code',
  status: 'CONFIRMADO' as const,
  tipoAsistencia: 'PRESENCIAL' as const,
  confirmedAt: '2026-04-20T10:00:00Z',
  verifiedAt: null,
  event: {
    id: 'ev-1',
    titulo: 'Evento Test',
    fechaHora: '2026-04-25T18:00:00Z',
    ubicacionPresencial: 'Sala Principal',
    linkVirtual: null,
  },
  ...overrides,
});

describe('Profile — AttendanceQRCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url === '/users/me') return Promise.resolve({ data: { id: 'user-1', email: 'test@test.com', nombres: 'Juan', apaterno: 'Perez', amaterno: '', roles: ['ASISTENTE'] } });
      if (url === '/attendance/my') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: {} });
    });
  });

  it('muestra QRCodeCanvas para asistencia PRESENCIAL', async () => {
    const presencialAttendance = makeAttendance({ tipoAsistencia: 'PRESENCIAL' });

    (api.get as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url === '/users/me') return Promise.resolve({ data: { id: 'user-1', email: 'test@test.com', nombres: 'Juan', apaterno: 'Perez', amaterno: '', roles: ['ASISTENTE'] } });
      if (url === '/attendance/my') return Promise.resolve({ data: [presencialAttendance] });
      return Promise.resolve({ data: {} });
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('qr-canvas')).toBeInTheDocument();
      expect(screen.getByTestId('qr-canvas')).toHaveAttribute('data-value', 'test-qr-code');
    });
  });

  it('muestra link virtual para asistencia VIRTUAL (sin QR)', async () => {
    const virtualAttendance = makeAttendance({
      tipoAsistencia: 'VIRTUAL',
      event: {
        id: 'ev-2',
        titulo: 'Evento Virtual',
        fechaHora: '2026-04-25T18:00:00Z',
        ubicacionPresencial: null,
        linkVirtual: 'https://meet.example.com/sala',
      },
    });

    (api.get as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url === '/users/me') return Promise.resolve({ data: { id: 'user-1', email: 'test@test.com', nombres: 'Juan', apaterno: 'Perez', amaterno: '', roles: ['ASISTENTE'] } });
      if (url === '/attendance/my') return Promise.resolve({ data: [virtualAttendance] });
      return Promise.resolve({ data: {} });
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.queryByTestId('qr-canvas')).not.toBeInTheDocument();
      expect(screen.getByRole('link', { name: /acceder al evento virtual/i })).toHaveAttribute(
        'href',
        'https://meet.example.com/sala',
      );
    });
  });

  it('muestra mensaje cuando no hay eventos confirmados', async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText(/no tenés eventos confirmados/i)).toBeInTheDocument();
    });
  });
});
