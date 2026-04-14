import api from './api';

export interface SmartAnalysis {
  healthScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  keyFindings: string[];
  recommendations: string[];
  summary: string;
  lastUpdated: string;
  organScores?: Record<string, number>;
  hasCriticalResults?: boolean;
  version?: number;
  isAmended?: boolean;
  amendmentReason?: string;
}

export interface ParameterTrend {
  parameterName: string;
  values: number[];
  dates: string[];
  referenceMin?: number;
  referenceMax?: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

export interface CriticalValue {
  parameterName: string;
  value: number;
  referenceRange: string;
  severity: 'WARNING' | 'CRITICAL';
  recommendation: string;
}

export const smartReportService = {
  /**
   * Get AI-powered smart analysis for a report
   */
  async getSmartAnalysis(reportId: number): Promise<SmartAnalysis> {
    const response = await api.get(`/api/reports/${reportId}/smart`);
    return response.data.data;
  },

  /**
   * Get historical trends for a specific test parameter
   */
  async getParameterTrends(reportId: number, testId: number): Promise<ParameterTrend[]> {
    const response = await api.get(`/api/reports/${reportId}/trends/${testId}`);
    return response.data.data || [];
  },

  /**
   * Get all critical and abnormal values from a report
   */
  async getCriticalValues(reportId: number): Promise<CriticalValue[]> {
    const response = await api.get(`/api/reports/${reportId}/critical`);
    return response.data.data || [];
  }
};
