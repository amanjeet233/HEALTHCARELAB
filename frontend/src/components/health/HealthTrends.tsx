import React, { useEffect, useState } from 'react';
import { Loader, TrendingUp, Calendar } from 'lucide-react';
import { healthDataService } from '../../services/healthDataService';

interface TrendData {
  date: string;
  value: number;
  status: 'improving' | 'declining' | 'stable';
}

export const HealthTrends: React.FC = () => {
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadTrends();
  }, [days]);

  const loadTrends = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await healthDataService.getHealthTrends(days);
      if (Array.isArray(data)) {
        const processed = data.map((item: any, idx: number) => {
          let status: 'improving' | 'declining' | 'stable' = 'stable';
          if (idx > 0) {
            if (item.value > data[idx - 1].value) status = 'improving';
            if (item.value < data[idx - 1].value) status = 'declining';
          }
          return {
            date: item.date || new Date().toISOString().slice(0, 10),
            value: item.value || 0,
            status
          };
        });
        setTrends(processed);
      }
    } catch (err) {
      setError((err as any).message || 'Failed to load health trends');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'improving') return 'text-green-600';
    if (status === 'declining') return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusBg = (status: string) => {
    if (status === 'improving') return 'bg-green-50 border-green-200';
    if (status === 'declining') return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'improving') return '📈';
    if (status === 'declining') return '📉';
    return '➡️';
  };

  const stats = {
    average: trends.length > 0 ? (trends.reduce((sum, t) => sum + t.value, 0) / trends.length).toFixed(1) : 0,
    max: trends.length > 0 ? Math.max(...trends.map(t => t.value)) : 0,
    min: trends.length > 0 ? Math.min(...trends.map(t => t.value)) : 0,
    improving: trends.filter(t => t.status === 'improving').length,
    declining: trends.filter(t => t.status === 'declining').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Time Period Selector */}
      <div className="flex gap-2">
        {[7, 30, 60, 90].map(d => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              days === d
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {d}d
          </button>
        ))}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-gray-600 mb-1">Average</p>
          <p className="text-lg font-bold text-blue-900">{stats.average}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <p className="text-xs text-gray-600 mb-1">Max</p>
          <p className="text-lg font-bold text-green-900">{stats.max}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
          <p className="text-xs text-gray-600 mb-1">Min</p>
          <p className="text-lg font-bold text-orange-900">{stats.min}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <p className="text-xs text-gray-600 mb-1">Trend</p>
          <p className="text-lg font-bold text-purple-900">
            {stats.improving > stats.declining ? '📈' : stats.declining > stats.improving ? '📉' : '➡️'}
          </p>
        </div>
      </div>

      {/* Trends Timeline */}
      {trends.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No health data available yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-2 p-4">
              {trends.map((trend, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${getStatusBg(trend.status)} transition-colors`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getStatusIcon(trend.status)}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(trend.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            weekday: 'short'
                          })}
                        </p>
                        <p className="text-xs text-gray-600">Value: {trend.value.toFixed(1)}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${getStatusColor(trend.status)}`}>
                      {trend.status === 'improving' ? 'Improving' : trend.status === 'declining' ? 'Declining' : 'Stable'}
                    </span>
                  </div>

                  {/* Mini progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <div
                      className={`h-1 rounded-full ${
                        trend.status === 'improving'
                          ? 'bg-green-500'
                          : trend.status === 'declining'
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${(trend.value / (stats.max || 100)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      {trends.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-2">Health Insights:</p>
              <ul className="space-y-1 text-xs list-disc list-inside">
                {stats.improving > 0 && (
                  <li>{stats.improving} measurements showing improvement</li>
                )}
                {stats.declining > 0 && (
                  <li>⚠️ {stats.declining} measurements declining - consider lifestyle changes</li>
                )}
                <li>Average value maintained at {stats.average}</li>
                <li>Data collected over {days} days</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
