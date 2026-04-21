'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Props {
  asistioCount: number;
  noAsistioCount: number;
  confirmadoPendiente: number;
}

export function AttendanceStatusChart({ asistioCount, noAsistioCount, confirmadoPendiente }: Props) {
  const data = [
    { name: 'Asistieron', value: asistioCount, fill: '#15803d' },
    { name: 'No asistieron', value: noAsistioCount, fill: '#b91c1c' },
    { name: 'Pendientes', value: confirmadoPendiente, fill: '#a16207' },
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
