/**
 * User Type Definitions
 * 
 * These types define the structure of user data throughout the application.
 * They should match the backend User model from Prisma.
 */

export interface User {
    id: number;
    email: string;
    name: string;
    createdAt: string;  // ISO date string from backend
    updatedAt: string;  // ISO date string from backend
}

/**
 * Authentication-related types
 */

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

/**
 * User state in the application
 * Can include just the token initially, then full user data after verification
 */
export interface UserState {
    token?: string;
    accessToken?: string;
    refreshToken?: string;
    user?: User;
}
