import api from './api';
import type { BookingResponse, CreateBookingRequest, BookingSearchParams } from '../types/booking';

export const bookingService = {
    /**
     * Get bookings with extended search and pagination
     */
    getMyBookings: async (params?: BookingSearchParams): Promise<{ bookings: BookingResponse[], totalPages: number }> => {
        try {
            const response = await api.get('/api/bookings/my', { params: params || {} });

            if (response.data && response.data.content) {
                return { bookings: response.data.content as BookingResponse[], totalPages: response.data.totalPages || 1 };
            }

            if (Array.isArray(response.data)) {
                return { bookings: response.data as BookingResponse[], totalPages: 1 };
            }

            return { bookings: [], totalPages: 1 };
        } catch (error) {
            console.error('Error fetching bookings:', error);
            throw error;
        }
    },

    /**
     * Get a single booking by ID
     */
    getBookingById: async (id: number): Promise<BookingResponse> => {
        try {
            const response = await api.get(`/api/bookings/${id}`);
            return (response.data?.data || response.data) as BookingResponse;
        } catch (error) {
            console.error(`Error fetching booking ${id}:`, error);
            throw error;
        }
    },

    /**
     * Create a new booking
     */
    createBooking: async (data: CreateBookingRequest): Promise<BookingResponse> => {
        try {
            const response = await api.post('/api/bookings', data);
            return (response.data?.data || response.data) as BookingResponse;
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    },

    /**
     * Cancel a booking
     */
    cancelBooking: async (id: number): Promise<BookingResponse> => {
        try {
            // Usually mappings on spring controllers for cancel look like this or similar:
            const response = await api.put(`/api/bookings/${id}/cancel`);
            return (response.data?.data || response.data) as BookingResponse;
        } catch (error) {
            console.error(`Error canceling booking ${id}:`, error);
            throw error;
        }
    }
};
