import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricData {
  date: string;
  value: number;
}

interface HealthMetricsChartProps {
  data: MetricData[];
  label: string;
  unit: string;
  normalMin?: number;
  normalMax?: number;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'orange';
}

export const HealthMetricsChart: React.FC<HealthMetricsChartProps> = ({
  data,
  label,
  unit,
  normalMin,
  normalMax,
  color = 'blue'
}) => {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700'
  };

  const lineColorMap = {
    blue: 'stroke-blue-500',
    green: 'stroke-green-500',
    red: 'stroke-red-500',
    purple: 'stroke-purple-500',
    orange: 'stroke-orange-500'
  };

  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return { min: 0, max: 0, current: 0, trend: 'stable' };
    }

    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const current = values[values.length - 1];
    const prev = values[values.length - 2] || current;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (current > prev) trend = 'up';
    else if (current < prev) trend = 'down';

    return { min, max, current, trend };
  }, [data]);

  // Generate sparkline SVG
  const generateSparkline = () => {
    if (!data || data.length < 2) return null;

    const values = data.map(d => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;

    const width = 120;
    const height = 40;
    const padding = 4;

    const points = values.map((val, idx) => {
      const x = (idx / (values.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((val - minVal) / range) * (height - padding * 2) - padding;
      return `${x},${y}`;
    });

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {/* Grid line for normal range */}
        {normalMin && normalMax && (
          <line
            x1="0"
            y1={height - ((normalMin - minVal) / range) * (height - padding * 2) - padding}
            x2={width}
            y2={height - ((normalMin - minVal) / range) * (height - padding * 2) - padding}
            stroke="#d1d5db"
            strokeDasharray="2,2"
            strokeWidth="0.5"
          />
        )}
        {/* Line chart */}
        <polyline
          points={points.join(' ')}
          fill="none"
          className={lineColorMap[color]}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Data points */}
        {points.map((point, idx) => (
          <circle
            key={idx}
            cx={point.split(',')[0]}
            cy={point.split(',')[1]}
            r="1.5"
            fill={color === 'red' ? '#ef4444' : color === 'green' ? '#22c55e' : '#3b82f6'}
          />
        ))}
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
          <div className="flex items-center gap-1">
            {stats.trend === 'up' && <TrendingUp className="w-4 h-4 text-red-500" />}
            {stats.trend === 'down' && <TrendingDown className="w-4 h-4 text-green-500" />}
            {stats.trend === 'stable' && <Minus className="w-4 h-4 text-gray-400" />}
          </div>
        </div>

        {/* Current Value */}
        <div className={`inline-block px-2 py-1 rounded-md text-sm font-bold ${colorMap[color]}`}>
          {stats.current.toFixed(1)} {unit}
        </div>
      </div>

      {/* Mini Chart */}
      <div className="h-10 mb-3 rounded bg-gray-50 p-1">
        {generateSparkline()}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-gray-500">Min</p>
          <p className="font-semibold text-gray-900">{stats.min.toFixed(1)}</p>
        </div>
        <div>
          <p className="text-gray-500">Max</p>
          <p className="font-semibold text-gray-900">{stats.max.toFixed(1)}</p>
        </div>
        <div>
          <p className="text-gray-500">Range</p>
          <p className="font-semibold text-gray-900">{(stats.max - stats.min).toFixed(1)}</p>
        </div>
      </div>

      {/* Normal Range Info */}
      {normalMin && normalMax && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Normal Range: {normalMin} - {normalMax} {unit}
          </p>
          {/* Status indicator */}
          {(stats.current < normalMin || stats.current > normalMax) && (
            <p className="text-xs text-red-600 font-medium mt-1">⚠️ Out of normal range</p>
          )}
          {stats.current >= normalMin && stats.current <= normalMax && (
            <p className="text-xs text-green-600 font-medium mt-1">✓ Within normal range</p>
          )}
        </div>
      )}
    </div>
  );
};
