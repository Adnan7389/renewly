import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
    LoginCredentials,
    RegisterData,
    AuthResponse,
    Subscription
} from '../types';
import type { UserPreferences } from '../types/preferences';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * API Service Class
 * 
 * Handles all HTTP requests to the backend API with:
 * - Automatic token injection via request interceptor
 * - Automatic token refresh on 403 errors via response interceptor
 * - Type-safe methods for all API endpoints
 */
class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor to add auth token
        this.api.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                const token = localStorage.getItem('accessToken');
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error: AxiosError) => Promise.reject(error)
        );

        // Response interceptor to handle token refresh
        this.api.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

                if (error.response?.status === 403 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const refreshToken = localStorage.getItem('refreshToken');
                        if (refreshToken) {
                            const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/refresh`, {
                                refreshToken,
                            });

                            const { accessToken } = response.data;
                            localStorage.setItem('accessToken', accessToken);

                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                            }

                            return this.api(originalRequest);
                        }
                    } catch (refreshError) {
                        console.error('Token refresh failed:', refreshError);
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        window.location.href = '/login';
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    /**
     * Set or remove the authorization token
     */
    setAuthToken = (token: string | null): void => {
        if (token) {
            this.api.defaults.headers.Authorization = `Bearer ${token}`;
        } else {
            delete this.api.defaults.headers.Authorization;
        }
    };

    // ==================== Auth Methods ====================

    /**
     * Register a new user
     */
    register = async (userData: RegisterData): Promise<AuthResponse> => {
        const response = await this.api.post<AuthResponse>('/auth/register', userData);
        return response.data;
    };

    /**
     * Login with email and password
     */
    login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await this.api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    };

    /**
     * Logout and invalidate refresh token
     */
    logout = async (refreshToken: string): Promise<void> => {
        await this.api.post('/auth/logout', { refreshToken });
    };

    // ==================== Subscription Methods ====================

    /**
     * Get all subscriptions for the authenticated user
     */
    getSubscriptions = async (): Promise<Subscription[]> => {
        const response = await this.api.get<Subscription[]>('/subscriptions');
        return response.data;
    };

    /**
     * Create a new subscription
     * Note: Backend expects current field names:
     * - cost
     * - startDate
     * - frequency
     */
    createSubscription = async (subscriptionData: any): Promise<Subscription> => {
        const response = await this.api.post<Subscription>('/subscriptions', subscriptionData);
        return response.data;
    };

    /**
     * Update an existing subscription
     * Note: Accepts any type because backend expects different field names
     */
    updateSubscription = async (id: string, subscriptionData: any): Promise<Subscription> => {
        const response = await this.api.put<Subscription>(`/subscriptions/${id}`, subscriptionData);
        return response.data;
    };

    /**
     * Delete a subscription
     */
    deleteSubscription = async (id: string): Promise<void> => {
        await this.api.delete(`/subscriptions/${id}`);
    };

    // ==================== Category Methods ====================

    getCategories = async (): Promise<any[]> => {
        const response = await this.api.get('/categories');
        return response.data;
    };

    createCategory = async (data: { name: string; color?: string }): Promise<any> => {
        const response = await this.api.post('/categories', data);
        return response.data;
    };

    // ==================== Tag Methods ====================

    getTags = async (): Promise<any[]> => {
        const response = await this.api.get('/tags');
        return response.data;
    };

    createTag = async (data: { name: string }): Promise<any> => {
        const response = await this.api.post('/tags', data);
        return response.data;
    };

    // ==================== User Preferences Methods ====================

    /**
     * Get user notification preferences
     */
    getPreferences = async (): Promise<UserPreferences> => {
        const response = await this.api.get<UserPreferences>('/users/preferences');
        return response.data;
    };

    /**
     * Update user notification preferences
     */
    updatePreferences = async (reminderDays: number): Promise<UserPreferences> => {
        const response = await this.api.put<UserPreferences>('/users/preferences', { reminderDays });
        return response.data;
    };

    // ==================== Generic Methods ====================

    /**
     * Generic GET request
     */
    get = async <T = any>(url: string): Promise<T> => {
        const response = await this.api.get<T>(url);
        return response.data;
    };

    /**
     * Generic POST request
     */
    post = async <T = any>(url: string, data?: any): Promise<T> => {
        const response = await this.api.post<T>(url, data);
        return response.data;
    };

    /**
     * Generic PUT request
     */
    put = async <T = any>(url: string, data?: any): Promise<T> => {
        const response = await this.api.put<T>(url, data);
        return response.data;
    };

    /**
     * Generic DELETE request
     */
    delete = async <T = any>(url: string): Promise<T> => {
        const response = await this.api.delete<T>(url);
        return response.data;
    };
}

export const api = new ApiService();
