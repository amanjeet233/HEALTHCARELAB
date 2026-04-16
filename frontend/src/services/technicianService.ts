import api from './api';

export const getTechnicianBookings = async () => {
    return api.get("/api/bookings/technician");
};

export const getUnassignedBookings = async () => {
    return api.get('/api/bookings/unassigned');
};

export const technicianService = {
    getTechnicianBookings,
    getUnassignedBookings,

    claimBooking: async (bookingId: number, technicianId: number) => {
        const response = await api.put(`/api/bookings/${bookingId}/technician`, { technicianId });
        return response.data?.data || response.data;
    },

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
     * Update booking status
     */
    updateBookingStatus: async (id: number, status: string, notes?: string) => {
        try {
            const body = notes ? { notes } : null;
            const response = await api.put(`/api/bookings/${id}/status`, body, { params: { status } });
            return response.data;
        } catch (error) {
            console.error(`Error marking booking ${id} as completed:`, error);
            throw error;
        }
    },

    /**
     * Backward-compatible alias used by existing dashboard code paths.
     */
    updateBookingCompletedStatus: async (id: number, notes?: string) => {
        return technicianService.updateBookingStatus(id, 'COMPLETED', notes);
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
    },

    uploadReport: async (bookingId: number, file: File, onProgress?: (percent: number) => void) => {
        const formData = new FormData();
        formData.append('bookingId', bookingId.toString());
        formData.append('file', file);
        const response = await api.post('/api/reports/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (event) => {
                if (!onProgress || !event.total) return;
                const percent = Math.round((event.loaded * 100) / event.total);
                onProgress(percent);
            }
        });
        return response.data?.data || response.data;
    },

    checkReportExists: async (bookingId: number) => {
        try {
            const response = await api.get(`/api/reports/booking/${bookingId}/exists`);
            return response.data?.data || response.data || null;
        } catch (error: any) {
            if (error.response?.status === 404) return null;
            throw error;
        }
    },

    rejectSpecimen: async (bookingId: number, reason: string, notes?: string) => {
        const response = await api.post(`/api/bookings/${bookingId}/reject-specimen`, {
            reason,
            notes: notes || null
        });
        return response.data?.data || response.data;
    },

    getRejectedSpecimens: async () => {
        const response = await api.get('/api/dashboard/technician/rejected');
        return response.data?.data || response.data || [];
    },

    getConsentStatus: async (bookingId: number) => {
        const response = await api.get(`/api/consent/${bookingId}`);
        return response.data?.data || response.data;
    },

    captureConsent: async (payload: { bookingId: number; consentGiven: boolean; patientSignatureData: string }) => {
        const response = await api.post('/api/consent/capture', payload);
        return response.data?.data || response.data;
    }
};
