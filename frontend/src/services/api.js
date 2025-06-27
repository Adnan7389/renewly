import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor to add auth token
        this.api.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor to handle token refresh
        this.api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 403 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const refreshToken = localStorage.getItem('refreshToken');
                        if (refreshToken) {
                            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                                refreshToken,
                            });

                            const { accessToken } = response.data;
                            localStorage.setItem('accessToken', accessToken);
                            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

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

    setAuthToken(token) {
        if (token) {
            this.api.defaults.headers.Authorization = `Bearer ${token}`;
        } else {
            delete this.api.defaults.headers.Authorization;
        }
    }

    // Auth methods
    async register(userData) {
        const response = await this.api.post('/auth/register', userData);
        return response.data;
    }

    async login(credentials) {
        const response = await this.api.post('/auth/login', credentials);
        return response.data;
    }

    async logout(refreshToken) {
        const response = await this.api.post('/auth/logout', { refreshToken });
        return response.data;
    }

    // Subscription methods
    async getSubscriptions() {
        const response = await this.api.get('/subscriptions');
        return response.data;
    }

    async createSubscription(subscriptionData) {
        const response = await this.api.post('/subscriptions', subscriptionData);
        return response.data;
    }

    async updateSubscription(id, subscriptionData) {
        const response = await this.api.put(`/subscriptions/${id}`, subscriptionData);
        return response.data;
    }

    async deleteSubscription(id) {
        const response = await this.api.delete(`/subscriptions/${id}`);
        return response.data;
    }

    // Generic methods
    async get(url) {
        const response = await this.api.get(url);
        return response.data;
    }

    async post(url, data) {
        const response = await this.api.post(url, data);
        return response.data;
    }

    async put(url, data) {
        const response = await this.api.put(url, data);
        return response.data;
    }

    async delete(url) {
        const response = await this.api.delete(url);
        return response.data;
    }
}

export const api = new ApiService();