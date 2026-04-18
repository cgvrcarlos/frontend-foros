'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { PageHero } from '@/components/ui/PageHero';
import { SectionCard } from '@/components/ui/SectionCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';

function ProfileField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 py-2 border-b border-border last:border-0">
      <dt className="text-sm text-text-muted">{label}</dt>
      <dd className="text-text-primary font-medium">{value?.trim() ? value : '—'}</dd>
    </div>
  );
}

function formatGenero(g?: string | null) {
  const map: Record<string, string> = {
    MASCULINO: 'Masculino',
    FEMENINO: 'Femenino',
    OTRO: 'Otro',
    NO_DICE: 'Prefiero no decir',
  };
  return g ? (map[g] ?? g) : undefined;
}

function formatGradoEstudios(g?: string | null) {
  const map: Record<string, string> = {
    PRIMARIA: 'Primaria',
    SECUNDARIA: 'Secundaria',
    PREPARATORIA: 'Preparatoria',
    LICENCIATURA: 'Licenciatura',
    POSGRADO: 'Posgrado',
    OTRO: 'Otro',
  };
  return g ? (map[g] ?? g) : undefined;
}

function formatSituacionLaboral(s?: string | null) {
  const map: Record<string, string> = {
    ESTUDIANTE: 'Estudiante',
    EMPLEADO: 'Empleado',
    AUTOEMPLEADO: 'Autoempleado',
    DESEMPLEADO: 'Desempleado',
    OTRO: 'Otro',
  };
  return s ? (map[s] ?? s) : undefined;
}

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-teal-dark">
        <p className="text-white/60">Cargando...</p>
      </div>
    );
  }

  if (!user) return null;

  const nombreCompleto = `${user.nombres} ${user.apaterno} ${user.amaterno}`.trim();

  return (
    <>
      <PageHero title="Mi Perfil" subtitle="Información registrada en tu cuenta" />

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {/* Section 1 — Datos personales */}
        <SectionCard title="Datos personales">
          <dl>
            <ProfileField label="Nombre completo" value={nombreCompleto} />
            <ProfileField label="Email" value={user.email} />
            <ProfileField label="Teléfono" value={user.telefono} />
            <ProfileField label="Redes sociales" value={user.redesSociales} />
          </dl>
        </SectionCard>

        {/* Section 2 — Domicilio */}
        <SectionCard title="Domicilio">
          <dl>
            <ProfileField label="Calle" value={user.calle} />
            <ProfileField label="Colonia" value={user.colonia} />
            <ProfileField label="Código postal" value={user.cp} />
            <ProfileField label="Municipio" value={user.municipio} />
          </dl>
        </SectionCard>

        {/* Section 3 — Datos demográficos */}
        <SectionCard title="Datos demográficos">
          <dl>
            <ProfileField label="Género" value={formatGenero(user.genero)} />
            <ProfileField label="Ocupación" value={user.ocupacion} />
            <ProfileField label="Grado de estudios" value={formatGradoEstudios(user.gradoEstudios)} />
            <ProfileField label="Escuela" value={user.escuela} />
            <ProfileField label="Situación laboral" value={formatSituacionLaboral(user.situacionLaboral)} />
          </dl>
        </SectionCard>

        <div className="flex flex-col sm:flex-row gap-3">
          <PrimaryButton disabled>Editar perfil</PrimaryButton>
          <SecondaryButton onClick={handleLogout}>Cerrar sesión</SecondaryButton>
        </div>
      </div>
    </>
  );
}
