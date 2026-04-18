import Image from 'next/image';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  size?: 'md' | 'lg';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthLayout({ title, subtitle, size = 'md', children, footer }: AuthLayoutProps) {
  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12"
      style={{ background: 'var(--gradient-auth)' }}
    >
      <div className={`w-full ${size === 'lg' ? 'max-w-lg' : 'max-w-md'}`}>
        <div className="flex justify-center mb-6">
          <Image src="/logo.svg" alt="Foro Ciudadano" width={56} height={56} priority />
        </div>
        <div className="bg-surface rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-text-muted">{subtitle}</p>}
          </div>
          {children}
        </div>
        {footer && <div className="mt-6 text-center text-sm text-white/80">{footer}</div>}
      </div>
    </div>
  );
}
