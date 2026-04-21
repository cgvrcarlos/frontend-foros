'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Props {
  confirmadosPresenciales: number;
  confirmadosVirtuales: number;
}

export function AttendanceTypeChart({ confirmadosPresenciales, confirmadosVirtuales }: Props) {
  const data = [
    { name: 'Presencial', value: confirmadosPresenciales, fill: '#0f766e' },
    { name: 'Virtual', value: confirmadosVirtuales, fill: '#7c3aed' },
  ].filter(d => d.value > 0);

  if (data.length === 0) return null;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
            {data.map(entry => <Cell key={entry.name} fill={entry.fill} />)}
          </Pie>
          <Tooltip formatter={(value: number, name: string) => [value, name]} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
