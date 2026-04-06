export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: 'PATIENT' | 'MEDICAL_OFFICER' | 'TECHNICIAN' | 'ADMIN';
    address?: string;
    dateOfBirth?: string;
    bloodGroup?: string;
    gender?: string;
}

export interface AuthData {
    accessToken: string;
    refreshToken: string;
    token?: string | null;
    user?: User;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: AuthData;
}

export interface LoginRequest {
    email: string;
    password?: string;
    role: 'PATIENT' | 'MEDICAL_OFFICER' | 'TECHNICIAN' | 'ADMIN';
}

export interface RegisterRequest {
    name: string;
    email: string;
    password?: string;
    phone: string;
    role: 'PATIENT' | 'MEDICAL_OFFICER' | 'TECHNICIAN' | 'ADMIN';
    address?: string;
    dateOfBirth?: string;
    gender?: string;
    bloodGroup?: string;
}
