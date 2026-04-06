import api from './api';

export interface HealthScore {
  score: number;
  category: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  lastUpdated: string;
  summary: string;
}

export interface HealthMetric {
  metricName: string;
  value: number;
  unit: string;
  normalMin?: number;
  normalMax?: number;
  lastMeasured: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export interface HealthTrend {
  metric: string;
  dates: string[];
  values: number[];
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  weeklyChange: number;
}

export interface HealthRecommendation {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  recommendation: string;
  impact: string;
  actionItems: string[];
}

export const healthScoreService = {
  /**
   * Get current health score for the logged-in user
   */
  async getCurrentScore(): Promise<HealthScore> {
    const response = await api.get('/api/health-score/current');
    return response.data.data;
  },

  /**
   * Get health score trends over time
   */
  async getScoreTrends(days: number = 30): Promise<HealthTrend[]> {
    const response = await api.get(`/api/health-score/trends?days=${days}`);
    return response.data.data || [];
  },

  /**
   * Get personalized health recommendations
   */
  async getRecommendations(): Promise<HealthRecommendation[]> {
    const response = await api.get('/api/health-score/recommendations');
    return response.data.data || [];
  },

  /**
   * Get current health metrics
   */
  async getHealthMetrics(): Promise<HealthMetric[]> {
    const response = await api.get('/api/health/metrics');
    return response.data.data || [];
  },

  /**
   * Get health metrics trends
   */
  async getHealthTrends(days: number = 30): Promise<HealthTrend[]> {
    const response = await api.get(`/api/health/trends?days=${days}`);
    return response.data.data || [];
  }
};
