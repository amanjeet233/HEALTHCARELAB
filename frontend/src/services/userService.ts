import api from './api';
import type { User } from '../types/auth';

export interface UpdateProfileRequest {
    name?: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    bloodGroup?: string;
    gender?: string;
}

export const userService = {
    /**
     * Fetch the current authenticated user's profile
     */
    getProfile: async (): Promise<User> => {
        try {
            const response = await api.get('/api/users/profile');
            return response.data as User;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    },

    /**
     * Update the current authenticated user's profile
     */
    updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
        try {
            const response = await api.put('/api/users/profile', data);
            return response.data as User;
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    },

    /**
     * Change user password
     */
    changePassword: async (data: { oldPassword?: string, newPassword: string }): Promise<void> => {
        try {
            await api.put('/api/users/profile/password', data);
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    },

    /**
     * Delete user account
     */
    deleteAccount: async (): Promise<void> => {
        try {
            await api.delete('/api/users/profile');
        } catch (error) {
            console.error('Error deleting account:', error);
            throw error;
        }
    }
};
