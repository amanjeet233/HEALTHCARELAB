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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // ✅ Hydrate persistence across page reloads with error handling
    useEffect(() => {
        let isMounted = true;

        const hydrateContext = async () => {
            try {
                const storedToken = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');

                if (storedToken && storedUser) {
                    try {
                        const parsedUser = JSON.parse(storedUser);
                        if (isMounted) {
                            setCurrentUser(parsedUser);
                        }
                    } catch (e) {
                        console.error("Failed to parse stored user", e);
                        // Clear corrupted data
                        localStorage.removeItem('token');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('user');
                    }
                }
            } catch (error) {
                console.error("Error during auth hydration:", error);
            } finally {
                // ✅ ALWAYS set loading to false, even if errors occur
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        hydrateContext();

        // ✅ Failsafe timeout - ensure loading never hangs forever
        const timeoutId = setTimeout(() => {
            if (isMounted && isLoading) {
                console.warn("Auth hydration timeout - forcing loading to false");
                setIsLoading(false);
            }
        }, 3000);

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

            const token = data.accessToken;
            const refreshToken = data.refreshToken;
            localStorage.setItem('token', token);
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }

            // Fetch profile if user data is not bundled in the response
            let user = data.user;
            if (!user) {
                try {
                    user = await userService.getProfile();
                } catch (profileError) {
                    console.error("Failed to fetch user profile after login", profileError);
                    throw new Error("Login successful, but failed to retrieve user profile.");
                }
            }

            localStorage.setItem('user', JSON.stringify(user));
            setCurrentUser(user);
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

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setCurrentUser(null);
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

