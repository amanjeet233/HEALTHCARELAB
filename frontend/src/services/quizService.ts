import api from './api';

export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    category: string;
}

export interface QuizAnswer {
    questionId: number;
    answer: string;
    question?: string;
    domain?: string;
}

export interface QuizRecommendation {
    title: string;
    description: string;
    category: string;
}

export interface QuizResult {
    id: number;
    score: number;
    vitalityScore: number;
    totalQuestions: number;
    recommendations: QuizRecommendation[];
    completedAt: string;
    date: string;
    answers: QuizAnswer[];
}

export interface QuizPerformance {
    userId: number;
    totalQuizzes: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    completionRate: number;
    trend: Array<{ date: string; score: number }>;
}

export interface QuizLeaderboardEntry {
    rank: number;
    userId: number;
    username: string;
    score: number;
    totalQuizzes: number;
    averageScore: number;
}

export interface QuizCategory {
    name: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
}

const normalizeResult = (raw: any): QuizResult => {
    const recommendations = (raw.recommendations || []).map((r: any) => {
        if (typeof r === 'string') {
            return { title: r, description: r, category: 'General' };
        }
        return { title: r.title || '', description: r.description || '', category: r.category || 'General' };
    });

    const answers = (raw.answers || []).map((a: any) => ({
        questionId: a.questionId || 0,
        answer: a.answer || '',
        question: a.question || '',
        domain: a.domain || a.category || ''
    }));

    return {
        id: raw.id || 0,
        score: raw.score || 0,
        vitalityScore: raw.vitalityScore || raw.score || 0,
        totalQuestions: raw.totalQuestions || 0,
        recommendations,
        completedAt: raw.completedAt || raw.date || new Date().toISOString(),
        date: raw.date || raw.completedAt || new Date().toISOString(),
        answers
    };
};

export const quizService = {
    getQuestions: async (): Promise<QuizQuestion[]> => {
        const response = await api.get('/api/quiz/questions');
        return response.data?.data || response.data || [];
    },

    submitQuiz: async (answers: { questionId: number; answer: string }[]): Promise<QuizResult> => {
        const response = await api.post('/api/quiz/submit', { answers });
        return normalizeResult(response.data?.data || response.data);
    },

    getHistory: async (): Promise<QuizResult[]> => {
        const response = await api.get('/api/quiz/history');
        const data = response.data?.data || response.data || [];
        return data.map(normalizeResult);
    },

    getQuizHistory: async (): Promise<QuizResult[]> => {
        return quizService.getHistory();
    },

    /**
     * Get user's quiz performance metrics
     */
    getQuizPerformance: async (userId?: number): Promise<QuizPerformance> => {
        try {
            const endpoint = userId ? `/api/quiz/performance/${userId}` : '/api/quiz/performance';
            const response = await api.get(endpoint);
            return response.data?.data || response.data || {
                userId: 0, totalQuizzes: 0, averageScore: 0, highestScore: 0,
                lowestScore: 0, completionRate: 0, trend: []
            };
        } catch (error) {
            console.error('Error fetching quiz performance:', error);
            return {
                userId: 0, totalQuizzes: 0, averageScore: 0, highestScore: 0,
                lowestScore: 0, completionRate: 0, trend: []
            };
        }
    },

    /**
     * Get global quiz leaderboard
     */
    getQuizLeaderboard: async (limit: number = 20): Promise<QuizLeaderboardEntry[]> => {
        try {
            const response = await api.get('/api/quiz/leaderboard', { params: { limit } });
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching quiz leaderboard:', error);
            return [];
        }
    },

    /**
     * Get quiz scores by category
     */
    getQuizCategoryScores: async (): Promise<QuizCategory[]> => {
        try {
            const response = await api.get('/api/quiz/categories');
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching quiz category scores:', error);
            return [];
        }
    },

    /**
     * Get quiz statistics for admin
     */
    getQuizStatistics: async (): Promise<any> => {
        try {
            const response = await api.get('/api/quiz/statistics');
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error fetching quiz statistics:', error);
            return null;
        }
    },

    /**
     * Compare user's quiz performance over time
     */
    getQuizProgressChart: async (days: number = 30): Promise<any[]> => {
        try {
            const response = await api.get('/api/quiz/progress', { params: { days } });
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching quiz progress:', error);
            return [];
        }
    }
};
