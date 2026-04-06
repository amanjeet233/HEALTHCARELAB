import api from './api';

export interface HealthAnalysis {
    id: number;
    userId: number;
    analysisType: 'VITAL_SIGNS' | 'METRICS' | 'RISK_ASSESSMENT' | 'TREND_ANALYSIS';
    findings: string[];
    riskFactors: string[];
    recommendations: string[];
    overallHealthScore: number;
    analysisDate: string;
}

export interface VitalSignsAnalysis extends HealthAnalysis {
    bloodPressure: { systolic: number; diastolic: number; status: string };
    heartRate: { value: number; status: string };
    temperature: { value: number; status: string };
    bmi: { value: number; status: string };
}

export interface RiskAssessment {
    userId: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    riskFactors: Array<{ factor: string; probability: number; severity: string }>;
    preventiveMeasures: string[];
    recommendedTests: number[];
    assessmentDate: string;
}

export interface HealthTrendAnalysis {
    metric: string;
    current: number;
    previous: number;
    trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
    changePercentage: number;
    recommendation: string;
}

export const healthAnalysisService = {
    /**
     * Get comprehensive health analysis
     */
    getHealthAnalysis: async (): Promise<HealthAnalysis> => {
        try {
            const response = await api.get('/api/health/analysis');
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error fetching health analysis:', error);
            throw error;
        }
    },

    /**
     * Get vital signs analysis
     */
    getVitalSignsAnalysis: async (): Promise<VitalSignsAnalysis> => {
        try {
            const response = await api.get('/api/health/vitals-analysis');
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error fetching vital signs analysis:', error);
            throw error;
        }
    },

    /**
     * Get personalized risk assessment
     */
    getRiskAssessment: async (): Promise<RiskAssessment> => {
        try {
            const response = await api.get('/api/health/risk-assessment');
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error fetching risk assessment:', error);
            throw error;
        }
    },

    /**
     * Get health trend analysis
     */
    getHealthTrendAnalysis: async (days: number = 30): Promise<HealthTrendAnalysis[]> => {
        try {
            const response = await api.get('/api/health/trend-analysis', { params: { days } });
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching trend analysis:', error);
            return [];
        }
    },

    /**
     * Get comparative health analysis (compare with previous period)
     */
    getComparativeAnalysis: async (previousPeriodDays: number = 30): Promise<any> => {
        try {
            const response = await api.get('/api/health/comparative-analysis', {
                params: { previousPeriodDays }
            });
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error fetching comparative analysis:', error);
            return null;
        }
    },

    /**
     * Generate health report (PDF)
     */
    generateHealthReport: async (): Promise<Blob> => {
        try {
            const response = await api.get('/api/health/report', { responseType: 'blob' });
            return response.data;
        } catch (error) {
            console.error('Error generating health report:', error);
            throw error;
        }
    },

    /**
     * Get health insights
     */
    getHealthInsights: async (category?: string): Promise<any[]> => {
        try {
            const response = await api.get('/api/health/insights', {
                params: category ? { category } : {}
            });
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching health insights:', error);
            return [];
        }
    },

    /**
     * Request personalized health consultation
     */
    requestConsultation: async (reason: string, preferredDate?: string): Promise<any> => {
        try {
            const response = await api.post('/api/health/consultation-request', {
                reason,
                preferredDate
            });
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error requesting consultation:', error);
            throw error;
        }
    },

    /**
     * Get health metrics comparison chart data
     */
    getMetricsComparisonChart: async (days: number = 30): Promise<any[]> => {
        try {
            const response = await api.get('/api/health/metrics-chart', { params: { days } });
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching metrics chart:', error);
            return [];
        }
    },

    /**
     * Export health analysis (admin)
     */
    exportHealthAnalysis: async (userId?: number, format: 'pdf' | 'csv' = 'pdf'): Promise<Blob> => {
        try {
            const endpoint = userId ? `/api/health/export/${userId}` : '/api/health/export';
            const response = await api.get(endpoint, {
                params: { format },
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Error exporting health analysis:', error);
            throw error;
        }
    }
};
