import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaHeartbeat, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { healthScoreService, type HealthScore, type HealthMetric, type HealthTrend, type HealthRecommendation } from '../services/healthScoreService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { notify } from '../utils/toast';

const HealthInsightsPage: React.FC = () => {
  const navigate = useNavigate();

  // Data States
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [trends, setTrends] = useState<HealthTrend[]>([]);
  const [recommendations, setRecommendations] = useState<HealthRecommendation[]>([]);

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load health insights on mount
  useEffect(() => {
    loadHealthInsights();
  }, []);

  const loadHealthInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load all health data in parallel
      const [score, metricsData, trendsData, recommsData] = await Promise.all([
        healthScoreService.getCurrentScore(),
        healthScoreService.getHealthMetrics(),
        healthScoreService.getScoreTrends(30),
        healthScoreService.getRecommendations()
      ]);

      setHealthScore(score);
      setMetrics(metricsData);
      setTrends(trendsData);
      setRecommendations(recommsData);

      notify.success('Health insights loaded successfully');
    } catch (err: any) {
      console.error('Error loading health insights:', err);
      const errorMsg = err.message || 'Failed to load health insights';
      setError(errorMsg);
      notify.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (category: string) => {
    switch (category) {
      case 'EXCELLENT': return 'bg-green-50 border-green-200 text-green-700';
      case 'GOOD': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'FAIR': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'POOR': return 'bg-red-50 border-red-200 text-red-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'NORMAL': return 'bg-green-100 text-green-700';
      case 'WARNING': return 'bg-yellow-100 text-yellow-700';
      case 'CRITICAL': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRecommendationColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-50 border-l-4 border-red-500';
      case 'MEDIUM': return 'bg-yellow-50 border-l-4 border-yellow-500';
      case 'LOW': return 'bg-blue-50 border-l-4 border-blue-500';
      default: return 'bg-gray-50 border-l-4 border-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#0D7C7C] font-600 hover:text-[#004B87] transition-colors mb-6"
        >
          <FaArrowLeft /> Back to Home
        </button>
        <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">
          Health Insights
        </h1>
        <p className="text-gray-600 mt-2">Personalized health analysis and recommendations</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <p className="font-600">{error}</p>
        </div>
      )}

      {/* Health Score Card */}
      {healthScore && (
        <div className={`mb-12 border-2 rounded-lg p-8 ${getScoreColor(healthScore.category)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80 uppercase font-600 tracking-widest mb-2">Overall Health Score</p>
              <p className="text-6xl font-black text-gray-900">{healthScore.score}</p>
              <p className="text-lg font-600 mt-2 opacity-70">{healthScore.category}</p>
            </div>
            <div className="text-6xl opacity-30">
              <FaHeartbeat />
            </div>
          </div>
          <p className="mt-4 text-sm opacity-80">{healthScore.summary}</p>
          <p className="text-xs opacity-60 mt-2">Last updated: {new Date(healthScore.lastUpdated).toLocaleDateString()}</p>
        </div>
      )}

      {/* Current Metrics */}
      {metrics.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6">Current Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric, idx) => (
              <div key={idx} className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-black text-gray-900 text-sm uppercase tracking-wider">{metric.metricName}</h4>
                    <p className="text-2xl font-black text-gray-900 mt-2">{metric.value}</p>
                    <p className="text-xs text-gray-600 opacity-70 mt-1">{metric.unit}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-600 rounded-full ${getMetricStatusColor(metric.status)}`}>
                    {metric.status}
                  </span>
                </div>
                {metric.normalMin !== undefined && metric.normalMax !== undefined && (
                  <div className="p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs text-gray-600 opacity-70">Normal Range</p>
                    <p className="text-sm font-600 text-gray-700">{metric.normalMin} - {metric.normalMax} {metric.unit}</p>
                  </div>
                )}
                <p className="text-xs text-gray-500 text-center mt-3">Measured: {new Date(metric.lastMeasured).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Trends */}
      {trends.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6">Health Trends (30 Days)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trends.map((trend, idx) => (
              <div key={idx} className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-black text-gray-900 text-sm uppercase tracking-wider">{trend.metric}</h4>
                  <span className={`text-xs font-600 uppercase ${
                    trend.trend === 'IMPROVING' ? 'text-green-600' :
                    trend.trend === 'STABLE' ? 'text-blue-600' :
                    'text-red-600'
                  }`}>
                    {trend.trend}
                  </span>
                </div>

                {/* Mini Chart */}
                <div className="bg-gray-50 rounded p-3 mb-4">
                  <div className="flex items-end justify-between h-12 gap-1">
                    {trend.values.slice(-7).map((value, i) => {
                      const maxVal = Math.max(...trend.values.slice(-7));
                      const minVal = Math.min(...trend.values.slice(-7));
                      const range = maxVal - minVal || 1;
                      const height = ((value - minVal) / range) * 100;
                      return (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-[#0D7C7C] to-[#4ECDC4] rounded-t opacity-70 hover:opacity-100 transition-opacity"
                          style={{ height: `${Math.max(20, height)}%` }}
                          title={value.toFixed(2)}
                        />
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">Last 7 measurements</p>
                </div>

                {/* Weekly Change */}
                <div className="text-center">
                  <p className="text-xs text-gray-600 opacity-70">Weekly Change</p>
                  <p className={`text-sm font-600 ${trend.weeklyChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {trend.weeklyChange > 0 ? '+' : ''}{trend.weeklyChange.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6">Recommendations</h2>
          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <div key={idx} className={`p-6 rounded-lg ${getRecommendationColor(rec.priority)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-black text-gray-900 text-sm uppercase tracking-wider">{rec.category}</h4>
                    <span className={`inline-block mt-2 px-3 py-1 text-xs font-600 rounded-full ${
                      rec.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                      rec.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {rec.priority} Priority
                    </span>
                  </div>
                  {rec.priority === 'HIGH' && <FaExclamationTriangle className="text-red-500 text-lg" />}
                  {rec.priority === 'MEDIUM' && <FaExclamationTriangle className="text-yellow-500 text-lg" />}
                  {rec.priority === 'LOW' && <FaCheckCircle className="text-blue-500 text-lg" />}
                </div>
                <p className="text-sm text-gray-700 mb-3">{rec.recommendation}</p>
                <p className="text-xs opacity-70 mb-3">Impact: {rec.impact}</p>
                {rec.actionItems.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-600 opacity-80 mb-2">Action Items:</p>
                    <ul className="space-y-1">
                      {rec.actionItems.map((item, i) => (
                        <li key={i} className="text-xs opacity-70 flex items-start gap-2">
                          <span>•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!healthScore && !metrics.length && !trends.length && !recommendations.length && (
        <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FaHeartbeat className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-600 text-gray-900 mb-2">No Health Data Available</h3>
          <p className="text-gray-600 mb-6">
            Complete your health assessments and tests to get personalized health insights
          </p>
          <button
            onClick={() => navigate('/booking/1')}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0D7C7C] text-white font-600 rounded-lg hover:bg-[#0a6666] transition-colors"
          >
            Book a Test
          </button>
        </div>
      )}

      {/* Action Buttons */}
      {(healthScore || metrics.length > 0) && (
        <div className="flex gap-4 pt-8 border-t border-gray-200">
          <button
            onClick={() => navigate('/')}
            className="flex-1 px-6 py-2.5 bg-gradient-to-r from-[#0D7C7C] to-[#004B87] text-white font-600 rounded-lg hover:shadow-lg transition-all"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => loadHealthInsights()}
            className="flex-1 px-6 py-2.5 bg-gray-100 text-gray-700 font-600 rounded-lg hover:bg-gray-200 transition-all"
          >
            Refresh Insights
          </button>
        </div>
      )}
    </div>
  );
};

export default HealthInsightsPage;
