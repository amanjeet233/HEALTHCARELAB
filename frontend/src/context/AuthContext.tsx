import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import api from '../services/api';
import { userService } from '../services/userService';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';

export interface AuthContextType {
    currentUser: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, newPassword: any) => Promise<void>;
    verifyEmail: (code: string) => Promise<void>;
    resendVerification: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Helper: wipe every user-specific key from localStorage.
 * Prevents data leaking between sessions / users on the same browser.
 */
const clearAllUserData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('medsync_cart_cache');
    localStorage.removeItem('healthlab_promo_seen');
    // Clear all healthlab.* keys (pending bookings, etc.)
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('healthlab.')) {
            localStorage.removeItem(key);
        }
    });
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // ✅ FIX 2: Hydrate by re-validating token against backend (not stale localStorage)
    useEffect(() => {
        let isMounted = true;

        const hydrateContext = async () => {
            try {
                const storedToken = localStorage.getItem('token');
                if (!storedToken) {
                    // No token = no session, clear everything
                    localStorage.removeItem('user');
                    localStorage.removeItem('medsync_cart_cache');
                    if (isMounted) setIsLoading(false);
                    return;
                }

                // Always re-fetch profile from backend to verify token is valid
                // and get FRESH user data (prevents stale data from previous session)
                try {
                    const freshUser = await userService.getProfile();
                    if (isMounted) {
                        localStorage.setItem('user', JSON.stringify(freshUser));
                        setCurrentUser(freshUser);
                    }
                } catch (profileError: any) {
                    // Token invalid/expired — clear everything
                    clearAllUserData();
                    if (isMounted) setCurrentUser(null);
                }
            } catch (error) {
                console.error('Auth hydration error:', error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        hydrateContext();

        // ✅ Failsafe timeout - ensure loading never hangs forever
        const timeoutId = setTimeout(() => {
            if (isMounted && isLoading) {
                console.warn("Auth hydration timeout - forcing loading to false");
                setIsLoading(false);
            }
        }, 5000);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, []);

    // ✅ Listen for global logout events from api.ts interceptor
    useEffect(() => {
        const handleLogoutEvent = () => {
            setCurrentUser(null);
            setIsLoading(false);
        };

        window.addEventListener('auth:logout', handleLogoutEvent);
        return () => window.removeEventListener('auth:logout', handleLogoutEvent);
    }, []);

    const login = async (credentials: LoginRequest) => {
        setIsLoading(true);
        try {
            const response = await api.post<AuthResponse>('/api/auth/login', credentials);
            const { success, message, data } = response.data;

            if (!success) {
                throw new Error(message || 'Authentication failed');
            }

            // Clear ALL previous user data before storing new session
            clearAllUserData();
            setCurrentUser(null);

            const token = data.accessToken;
            const refreshToken = data.refreshToken;
            // The role is always available directly from the auth response
            const authRole = data.role;

            localStorage.setItem('token', token);
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }

            // Try to fetch full profile, fall back to auth response data
            let user: any;
            try {
                user = await userService.getProfile();
            } catch (profileError) {
                console.warn("Profile fetch failed, using auth response data", profileError);
                // Build a minimal user from auth response fields
                user = {
                    id: data.userId,
                    name: data.name || data.email,
                    email: data.email,
                    role: authRole,
                };
            }

            // Ensure role is always set (profile endpoint might not return it correctly)
            if (!user.role && authRole) {
                user.role = authRole;
            }

            localStorage.setItem('user', JSON.stringify(user));
            setCurrentUser(user);
            
            // Fire redirect event — use authRole from login response (most reliable source)
            window.dispatchEvent(new CustomEvent('auth:login:success', {
                detail: { role: authRole || user.role }
            }));
            
            toast.success(message || `Welcome back, ${user.name}!`);
        } catch (error: unknown) {
            const errorMsg = axios.isAxiosError(error)
                ? (error.response?.data?.message || error.message)
                : (error instanceof Error ? error.message : 'Authentication failed.');
            toast.error(errorMsg);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: RegisterRequest) => {
        setIsLoading(true);
        try {
            const response = await api.post<AuthResponse>('/api/auth/register', userData);
            const { success, message, data } = response.data;

            if (!success) {
                throw new Error(message || 'Registration failed');
            }

            // Clear previous session data before storing new
            clearAllUserData();
            setCurrentUser(null);

            const token = data.accessToken;
            const refreshToken = data.refreshToken;
            localStorage.setItem('token', token);
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }

            // Handle user profile hydration for registration as well
            let user = data.user;
            if (!user) {
                user = await userService.getProfile();
            }

            localStorage.setItem('user', JSON.stringify(user));
            setCurrentUser(user);
            
            // Fire a custom event so any listener can redirect based on role
            window.dispatchEvent(new CustomEvent('auth:login:success', {
                detail: { role: user.role }
            }));
            
            toast.success(message || 'Registration successful. Welcome!');
        } catch (error: unknown) {
            const errorMsg = axios.isAxiosError(error)
                ? (error.response?.data?.message || error.message)
                : (error instanceof Error ? error.message : 'Registration failed.');
            toast.error(errorMsg);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ FIX 3: Clear ALL user-specific data — prevents data leaking to next user
    const logout = () => {
        clearAllUserData();
        sessionStorage.clear();
        setCurrentUser(null);
        // Fire event so CartContext (and other listeners) reset
        window.dispatchEvent(new Event('auth:logout'));
        toast.success('Logged out successfully');
    };

    const forgotPassword = async (email: string) => {
        setIsLoading(true);
        try {
            await api.post('/api/auth/forgot-password', { email });
            toast.success('Recovery pulse transmitted.');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Signal lost.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async (token: string, newPassword: any) => {
        setIsLoading(true);
        try {
            await api.post('/api/auth/reset-password', { token, newPassword });
            toast.success('Neural passcode reconfigured.');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Config fail.');
        } finally {
            setIsLoading(false);
        }
    };

    const verifyEmail = async (code: string) => {
        setIsLoading(true);
        try {
            await api.post('/api/auth/verify-email', { code });
            toast.success('Identity validated.');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Validation error.');
        } finally {
            setIsLoading(false);
        }
    };

    const resendVerification = async () => {
        setIsLoading(true);
        try {
            await api.post('/api/auth/resend-verification');
            toast.success('Verification signal resent.');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Resend failure.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                isAuthenticated: !!currentUser,
                isLoading,
                login,
                register,
                logout,
                forgotPassword,
                resetPassword,
                verifyEmail,
                resendVerification,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
