import api from './api';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'critical';
    timestamp: string;
    read: boolean;
    category: 'system' | 'medical' | 'appointment' | 'security';
    actionLink?: string;
}

export interface NotificationPreference {
    category: 'system' | 'medical' | 'appointment' | 'security';
    emailEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
}

export const notificationService = {
    /**
     * Get all notifications
     */
    getNotifications: async (): Promise<Notification[]> => {
        try {
            const response = await api.get('/api/notifications');
            return response.data?.data || response.data?.content || response.data || [];
        } catch (error) {
            console.error('Error fetching notifications', error);
            return [];
        }
    },

    /**
     * Get unread count
     */
    getUnreadCount: async (): Promise<number> => {
        try {
            const response = await api.get('/api/notifications/unread-count');
            // Backend returns Map.of("unreadCount", count) inside ApiResponse.success
            const data = response.data?.data;
            if (data && typeof data === 'object' && 'unreadCount' in data) {
                return data.unreadCount;
            }
            return typeof data === 'number' ? data : (response.data?.unreadCount ?? 0);
        } catch (error) {
            console.error('Error fetching unread count', error);
            return 0;
        }
    },

    /**
     * Mark a notification as read
     */
    markAsRead: async (id: string): Promise<void> => {
        await api.put(`/api/notifications/${id}/read`);
    },

    /**
     * Mark all as read
     */
    markAllAsRead: async (): Promise<void> => {
        await api.put('/api/notifications/read-all');
    },

    /**
     * Delete a notification
     */
    deleteNotification: async (id: string): Promise<void> => {
        await api.delete(`/api/notifications/${id}`);
    },

    /**
     * Subscribe to real-time notifications via MSE (stubbed for future WebSocket)
     */
    subscribe: (_onNotification: (n: Notification) => void) => {
        // Here you would connect an EventSource or WebSocket.
        // For now, poll or return a no-op unsubscribe
        return () => {};
    },

    /**
     * Get notification preferences
     */
    getNotificationPreferences: async (): Promise<NotificationPreference[]> => {
        try {
            const response = await api.get('/api/notifications/preferences');
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching notification preferences:', error);
            return [];
        }
    },

    /**
     * Update notification preferences
     */
    updateNotificationPreferences: async (preferences: NotificationPreference[]): Promise<NotificationPreference[]> => {
        try {
            const response = await api.put('/api/notifications/preferences', { preferences });
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error updating notification preferences:', error);
            throw error;
        }
    },

    /**
     * Update preference for a single category
     */
    updateCategoryPreference: async (category: string, preference: Partial<NotificationPreference>): Promise<NotificationPreference> => {
        try {
            const response = await api.put(`/api/notifications/preferences/${category}`, preference);
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Error updating category preference:', error);
            throw error;
        }
    },

    /**
     * Get notification history/archive
     */
    getNotificationHistory: async (params?: { days?: number; limit?: number }): Promise<Notification[]> => {
        try {
            const response = await api.get('/api/notifications/history', { params });
            return response.data?.data || response.data?.content || response.data || [];
        } catch (error) {
            console.error('Error fetching notification history:', error);
            return [];
        }
    }
};
