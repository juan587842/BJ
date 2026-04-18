'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SalesChartProps {
  data: { hora: string; valor: number; quantidade: number }[];
}

export default function SalesChart({ data }: SalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(148, 163, 184, 0.1)"
          vertical={false}
        />
        <XAxis
          dataKey="hora"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: 'rgba(148, 163, 184, 0.6)' }}
          interval={2}
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
          formatter={(value: number, name: string) => {
            if (name === 'valor') return [`R$ ${value.toFixed(2)}`, 'Faturamento'];
            if (name === 'quantidade') return [`${value} itens`, 'Quantidade'];
            return [value, name];
          }}
        />
        <Bar
          dataKey="valor"
          fill="rgba(79, 70, 229, 0.7)"
          radius={[4, 4, 0, 0]}
          maxBarSize={32}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
