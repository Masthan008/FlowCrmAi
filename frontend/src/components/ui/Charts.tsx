import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

// Custom Tooltip component matching the premium white glossy theme
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card border border-slate-100 shadow-glossy-md p-3.5 text-xs">
        {label && <p className="font-semibold text-slate-800 mb-1.5">{label}</p>}
        <div className="space-y-1">
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
              <span className="text-slate-500 font-medium">{item.name}:</span>
              <span className="text-slate-800 font-bold">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

interface ChartData {
  [key: string]: any;
}

interface LineChartProps {
  data: ChartData[];
  xKey: string;
  series: { key: string; name: string; color?: string }[];
  height?: number;
}

export const LineChartWrapper: React.FC<LineChartProps> = ({
  data,
  xKey,
  series,
  height = 300,
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey={xKey}
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dx={-5}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', fontWeight: 550, color: '#64748b' }}
          />
          {series.map((s, idx) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color || ['#2563eb', '#93c5fd', '#38bdf8'][idx % 3]}
              strokeWidth={2}
              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              dot={{ r: 3, strokeWidth: 1 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface BarChartProps {
  data: ChartData[];
  xKey: string;
  series: { key: string; name: string; color?: string }[];
  height?: number;
}

export const BarChartWrapper: React.FC<BarChartProps> = ({
  data,
  xKey,
  series,
  height = 300,
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey={xKey}
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dx={-5}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', fontWeight: 550, color: '#64748b' }}
          />
          {series.map((s, idx) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              fill={s.color || ['#2563eb', '#c2dbff', '#7dd3fc'][idx % 3]}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface PieChartProps {
  data: { name: string; value: number; color?: string }[];
  height?: number;
}

export const PieChartWrapper: React.FC<PieChartProps> = ({
  data,
  height = 300,
}) => {
  const defaultColors = ['#2563eb', '#60a5fa', '#93c5fd', '#bfdbfe', '#eff6ff'];

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || defaultColors[index % defaultColors.length]}
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', fontWeight: 550, color: '#64748b' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
