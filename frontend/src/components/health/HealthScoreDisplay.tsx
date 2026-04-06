import React, { useEffect, useState } from 'react';
import { Loader, TrendingUp, AlertCircle } from 'lucide-react';
import { healthScoreService } from '../../services/healthScoreService';

export const HealthScoreDisplay: React.FC = () => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState<'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'>('FAIR');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [breakdown, setBreakdown] = useState<Record<string, number>>({});

  useEffect(() => {
    loadHealthScore();
  }, []);

  const loadHealthScore = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await healthScoreService.getHealthScore();
      setScore(data.score || 65);
      setLevel(data.level || 'FAIR');
      setBreakdown(data.breakdown || {});
    } catch (err) {
      setError((err as any).message || 'Failed to load health score');
      setScore(65);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = () => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getLevelDescription = () => {
    const descriptions = {
      EXCELLENT: 'Your health metrics are excellent. Keep up the great work!',
      GOOD: 'Your health is good. Continue with healthy habits.',
      FAIR: 'Your health is fair. Consider making some lifestyle changes.',
      POOR: 'Your health needs attention. Please consult a doctor.'
    };
    return descriptions[level];
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

      {/* Main Score Card */}
      <div className={`rounded-lg p-8 ${getScoreBgColor()} border-2 border-transparent`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Your Health Score</p>
            <p className={`text-5xl font-bold ${getScoreColor()}`}>{score}/100</p>
            <p className="text-sm text-gray-600 mt-2">{level}</p>
          </div>

          {/* Score Circle */}
          <div className="relative w-24 h-24">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              {/* Score circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : score >= 40 ? '#f97316' : '#ef4444'}
                strokeWidth="8"
                strokeDasharray={`${(score / 100) * 251.2} 251.2`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-lg font-bold ${getScoreColor()}`}>{score}%</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 mt-4">{getLevelDescription()}</p>
      </div>

      {/* Breakdown by Category */}
      {Object.keys(breakdown).length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Score Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(breakdown).map(([category, value]) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{category}</span>
                  <span className="text-sm font-bold text-gray-900">{value}/100</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex gap-3">
          <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Tips to improve your score:</p>
            <ul className="space-y-1 text-xs list-disc list-inside">
              <li>Stay physically active for at least 30 minutes daily</li>
              <li>Maintain a balanced and nutritious diet</li>
              <li>Get 7-8 hours of quality sleep</li>
              <li>Stay hydrated throughout the day</li>
              <li>Manage stress with meditation or yoga</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <button
        onClick={loadHealthScore}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Refresh Score
      </button>
    </div>
  );
};
