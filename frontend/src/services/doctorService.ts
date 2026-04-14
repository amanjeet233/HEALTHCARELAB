import api from './api';
import type { BookingResponse, BookingSearchParams } from '../types/booking';

export const getPendingRequests = async () => {
    return api.get("/api/mo/pending", { params: { page: 0, size: 10 } });
};

export const doctorService = {
    getPendingRequests,

    /**
     * Verify a report
     */
    verifyReport: async (bookingId: number): Promise<any> => {
        try {
            // Note: The backend endpoint was updated to /api/reports/verify/{id}
            const response = await api.post(`/api/mo/verify/${bookingId}`, {
                clinicalNotes: 'Looks good',
                digitalSignature: 'SIG_123',
                approved: true,
                specialistType: 'GENERAL'
            });
            return response.data;
        } catch (error) {
            console.error(`Error verifying report for booking ${bookingId}:`, error);
            throw error;
        }
    },

    /**
     * Reject a report
     */
    rejectReport: async (bookingId: number, reason: string): Promise<any> => {
        try {
            const response = await api.post(`/api/mo/reject/${bookingId}`, { reason });
            return response.data;
        } catch (error) {
            console.error(`Error rejecting report for booking ${bookingId}:`, error);
            throw error;
        }
    },

    /**
     * Get pending approvals count
     */
    getPendingCount: async (): Promise<number> => {
        try {
            const response = await api.get('/api/mo/pending/count');
            return response.data.data as number;
        } catch (error) {
            console.error('Error fetching pending count:', error);
            // Return 0 if failed to avoid blocking dashboard render
            return 0;
        }
    },

    /**
     * Get pending approvals list with pagination and search
     */
    getPendingApprovals: async (params?: BookingSearchParams): Promise<{ bookings: BookingResponse[], totalPages: number }> => {
        try {
            const response = await api.get('/api/mo/pending', { params: params || {} });

            if (response.data && response.data.data && response.data.data.content) {
                return { bookings: response.data.data.content as BookingResponse[], totalPages: response.data.data.totalPages || 1 };
            }

            if (response.data && response.data.content) {
                return { bookings: response.data.content as BookingResponse[], totalPages: response.data.totalPages || 1 };
            }

            if (Array.isArray(response.data)) {
                return { bookings: response.data as BookingResponse[], totalPages: 1 };
            }

            return { bookings: [], totalPages: 1 };
        } catch (error) {
            console.error('Error fetching pending approvals:', error);
            throw error;
        }
    },

    /**
     * Update booking status (Confirm / Reject)
     */
    updateBookingStatus: async (id: number, status: string): Promise<BookingResponse> => {
        try {
            const response = await api.put(`/api/bookings/${id}/status`, null, { params: { status } });
            return response.data as BookingResponse;
        } catch (error) {
            console.error(`Error updating booking status ${id}:`, error);
            throw error;
        }
    },

    /**
     * Get all bookings (Doctor Access)
     */
    getAllBookings: async (params?: BookingSearchParams): Promise<{ bookings: BookingResponse[], totalPages: number }> => {
        try {
            const response = await api.get('/api/bookings', { params: params || {} });

            if (response.data && response.data.content) {
                return { bookings: response.data.content as BookingResponse[], totalPages: response.data.totalPages || 1 };
            }

            if (Array.isArray(response.data)) {
                return { bookings: response.data as BookingResponse[], totalPages: 1 };
            }

            return { bookings: [], totalPages: 1 };
        } catch (error) {
            console.error('Error fetching all bookings:', error);
            throw error;
        }
    },

    /**
     * Search patients by name, email, or phone
     */
    searchPatients: async (query: string): Promise<Record<string, unknown>[]> => {
        try {
            const response = await api.get('/api/users/patients/search', { params: { query } });
            return response.data;
        } catch (error) {
            console.error('Error searching patients:', error);
            return [];
        }
    },

    /**
     * Get patient's booking history
     */
    getPatientBookings: async (patientId: number): Promise<BookingResponse[]> => {
        try {
            const response = await api.get(`/api/patients/${patientId}/bookings`);
            return response.data as BookingResponse[];
        } catch (error) {
            console.error(`Error fetching bookings for patient ${patientId}:`, error);
            return [];
        }
    },

    /**
     * Get dashboard stats (aggregated)
     */
    getDashboardStats: async (): Promise<{ todayBookings: number, totalPatientsMonth: number, completedTests: number, pendingCount: number }> => {
        try {
            const response = await api.get('/api/dashboard/medical-officer/stats');
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error fetching stats:', error);
            return { todayBookings: 0, totalPatientsMonth: 0, completedTests: 0, pendingCount: 0 };
        }
    },

    /**
     * Get tests assigned to this doctor
     */
    getAssignedTests: async (): Promise<any[]> => {
        try {
            const response = await api.get('/api/doctors/me/tests');
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching assigned tests:', error);
            return [];
        }
    },

    /**
     * Get doctor specializations
     */
    getSpecializations: async (): Promise<string[]> => {
        try {
            const response = await api.get('/api/doctors/specializations');
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching specializations:', error);
            return [];
        }
    },

    /**
     * Update doctor specialization
     */
    updateSpecialization: async (specialization: string): Promise<any> => {
        try {
            const response = await api.put('/api/doctors/me/specialization', { specialization });
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error updating specialization:', error);
            throw error;
        }
    },

    /**
     * Get doctor availability details
     */
    getDoctorAvailability: async (doctorId?: number): Promise<any> => {
        try {
            const endpoint = doctorId ? `/api/doctors/${doctorId}/availability` : '/api/doctors/me/availability';
            const response = await api.get(endpoint);
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error fetching availability:', error);
            return null;
        }
    },

    /**
     * Update doctor availability
     */
    updateAvailability: async (availabilityData: any): Promise<any> => {
        try {
            const response = await api.put('/api/doctors/me/availability', availabilityData);
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error updating availability:', error);
            throw error;
        }
    }
};
