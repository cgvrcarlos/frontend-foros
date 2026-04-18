import Link from 'next/link';

const SIZES = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-2.5 text-sm', lg: 'px-6 py-3 text-base' };

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  'aria-label'?: string;
}

const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-semibold bg-orange-cta text-white hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-accent focus-visible:ring-offset-2 transition';

export function PrimaryButton({ children, onClick, href, disabled, type = 'button', size = 'md', className = '', 'aria-label': ariaLabel }: ButtonProps) {
  const cls = `${base} ${SIZES[size]} ${className}`;
  if (href) return <Link href={href} className={cls} aria-label={ariaLabel}>{children}</Link>;
  return <button type={type} onClick={onClick} disabled={disabled} className={cls} aria-label={ariaLabel}>{children}</button>;
}
