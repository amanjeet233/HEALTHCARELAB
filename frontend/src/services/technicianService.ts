import api from './api';

export const getTechnicianBookings = async () => {
    return api.get("/api/bookings/technician");
};

export const technicianService = {
    getTechnicianBookings,

    /**
     * Update booking status to SAMPLE_COLLECTED
     */
    updateCollectionStatus: async (id: number) => {
        try {
            const response = await api.put(`/api/bookings/${id}/collection`);
            return response.data;
        } catch (error) {
            console.error(`Error marking collection ${id} as completed:`, error);
            throw error;
        }
    },

    /**
     * Update booking status to COMPLETED after successful report upload
     */
    updateBookingCompletedStatus: async (id: number, notes?: string) => {
        try {
            const body = notes ? { notes } : null;
            const response = await api.put(`/api/bookings/${id}/status`, body, { params: { status: 'COMPLETED' } });
            return response.data;
        } catch (error) {
            console.error(`Error marking booking ${id} as completed:`, error);
            throw error;
        }
    },

    /**
     * Get technician dashboard stats
     */
    getDashboardStats: async () => {
        try {
            const response = await api.get('/api/dashboard/technician/stats');
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error fetching technician stats:', error);
            return { todayCollections: 0, pendingCollections: 0, completedToday: 0, weekTotal: 0 };
        }
    },

    /**
     * Get technician collection history
     */
    getCollectionHistory: async (params?: Record<string, string | number>) => {
        try {
            const response = await api.get('/api/bookings/technician/history', { params: params || {} });

            if (response.data && response.data.content) {
                return response.data.content;
            }
            if (Array.isArray(response.data)) {
                return response.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching collection history:', error);
            return [];
        }
    }
};
