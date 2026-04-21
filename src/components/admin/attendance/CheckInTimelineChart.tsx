'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { VerifiedTimelineBucket } from '@/types/api';

interface Props { data: VerifiedTimelineBucket[]; }

export function CheckInTimelineChart({ data }: Props) {
  if (data.length === 0) return null;
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="hour" tick={{ fontSize: 12 }} stroke="#6b7280" />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#6b7280" />
          <Tooltip formatter={(value: number) => [value, 'Check-ins']} labelFormatter={(label) => `Hora: ${label}`} />
          <Bar dataKey="count" fill="#0f766e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
