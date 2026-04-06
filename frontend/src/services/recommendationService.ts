import api from './api';

export interface HealthRecommendation {
    id: number;
    title: string;
    description: string;
    category: 'lifestyle' | 'medical' | 'nutrition' | 'exercise';
    priority: 'high' | 'medium' | 'low';
    actionUrl?: string;
    estimatedBenefit: string;
    relatedTests?: number[];
    createdAt: string;
}

export interface RecommendationAction {
    id: number;
    recommendationId: number;
    userId: number;
    actionTaken: boolean;
    actionDate?: string;
    feedback?: string;
}

export interface PersonalizedRecommendation extends HealthRecommendation {
    relevanceScore: number;
    reasoning: string;
    deadline?: string;
}

export const recommendationService = {
    /**
     * Get all health recommendations
     */
    getAllRecommendations: async (params?: { category?: string; priority?: string }): Promise<HealthRecommendation[]> => {
        try {
            const response = await api.get('/api/recommendations', { params });
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            return [];
        }
    },

    /**
     * Get personalized recommendations for current user
     */
    getPersonalizedRecommendations: async (): Promise<PersonalizedRecommendation[]> => {
        try {
            const response = await api.get('/api/recommendations/personalized');
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching personalized recommendations:', error);
            return [];
        }
    },

    /**
     * Get recommendations by category
     */
    getRecommendationsByCategory: async (category: string): Promise<HealthRecommendation[]> => {
        try {
            const response = await api.get(`/api/recommendations/category/${category}`);
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error(`Error fetching recommendations for category ${category}:`, error);
            return [];
        }
    },

    /**
     * Get recommendations by priority
     */
    getRecommendationsByPriority: async (priority: 'high' | 'medium' | 'low'): Promise<HealthRecommendation[]> => {
        try {
            const response = await api.get(`/api/recommendations/priority/${priority}`);
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error(`Error fetching ${priority} priority recommendations:`, error);
            return [];
        }
    },

    /**
     * Get recommendation details
     */
    getRecommendationById: async (id: number): Promise<HealthRecommendation> => {
        try {
            const response = await api.get(`/api/recommendations/${id}`);
            return response.data?.data || response.data;
        } catch (error) {
            console.error(`Error fetching recommendation ${id}:`, error);
            throw error;
        }
    },

    /**
     * Mark recommendation as actioned
     */
    markRecommendationActioned: async (recommendationId: number, feedback?: string): Promise<RecommendationAction> => {
        try {
            const response = await api.post(`/api/recommendations/${recommendationId}/action`, { feedback });
            return response.data?.data || response.data;
        } catch (error) {
            console.error(`Error marking recommendation ${recommendationId} as actioned:`, error);
            throw error;
        }
    },

    /**
     * Get user's recommendation actions
     */
    getUserRecommendationActions: async (): Promise<RecommendationAction[]> => {
        try {
            const response = await api.get('/api/recommendations/actions');
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching recommendation actions:', error);
            return [];
        }
    },

    /**
     * Create new health recommendation (admin)
     */
    createRecommendation: async (data: Omit<HealthRecommendation, 'id' | 'createdAt'>): Promise<HealthRecommendation> => {
        try {
            const response = await api.post('/api/recommendations', data);
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error creating recommendation:', error);
            throw error;
        }
    },

    /**
     * Update health recommendation (admin)
     */
    updateRecommendation: async (id: number, data: Partial<HealthRecommendation>): Promise<HealthRecommendation> => {
        try {
            const response = await api.put(`/api/recommendations/${id}`, data);
            return response.data?.data || response.data;
        } catch (error) {
            console.error(`Error updating recommendation ${id}:`, error);
            throw error;
        }
    },

    /**
     * Delete health recommendation (admin)
     */
    deleteRecommendation: async (id: number): Promise<void> => {
        try {
            await api.delete(`/api/recommendations/${id}`);
        } catch (error) {
            console.error(`Error deleting recommendation ${id}:`, error);
            throw error;
        }
    },

    /**
     * Get recommendation statistics
     */
    getRecommendationStats: async (): Promise<any> => {
        try {
            const response = await api.get('/api/recommendations/stats');
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error fetching recommendation stats:', error);
            return null;
        }
    }
};
