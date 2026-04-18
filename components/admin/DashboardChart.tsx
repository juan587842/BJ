'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardChartProps {
  data: { dia: string; data: string; valor: number; quantidade: number }[];
}

export default function DashboardChart({ data }: DashboardChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(148, 163, 184, 0.1)"
          vertical={false}
        />
        <XAxis
          dataKey="dia"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: 'rgba(148, 163, 184, 0.6)' }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: 'rgba(148, 163, 184, 0.6)' }}
          tickFormatter={(v) => `R$${v}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '8px',
            fontSize: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
          labelStyle={{ color: 'rgba(203, 213, 225, 0.8)', marginBottom: '4px' }}
          formatter={((value: number | undefined, name: string) => {
            if (name === 'valor') return [`R$ ${(value ?? 0).toFixed(2)}`, 'Faturamento'];
            if (name === 'quantidade') return [`${value ?? 0} vendas`, 'Quantidade'];
            return [value, name];
          }) as any}
        />
        <Line
          type="monotone"
          dataKey="valor"
          stroke="rgba(79, 70, 229, 0.9)"
          strokeWidth={3}
          dot={{ r: 3, fill: 'rgba(79, 70, 229, 1)', strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#fff', stroke: 'rgba(79, 70, 229, 1)', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
