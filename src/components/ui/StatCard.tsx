import type { ReactNode } from 'react';

export type StatCardTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: StatCardTone;
  icon?: ReactNode;
  className?: string;
}

const TONE_VALUE: Record<StatCardTone, string> = {
  neutral: 'text-gray-900',
  success: 'text-green-700',
  warning: 'text-yellow-700',
  danger: 'text-red-700',
  info: 'text-teal-700',
};

export function StatCard({ label, value, hint, tone = 'neutral', icon, className = '' }: StatCardProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-1 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        {icon ? <span className="text-gray-400">{icon}</span> : null}
      </div>
      <p className={`text-3xl font-bold ${TONE_VALUE[tone]}`}>{value}</p>
      {hint ? <p className="text-xs text-gray-400">{hint}</p> : null}
    </div>
  );
}
