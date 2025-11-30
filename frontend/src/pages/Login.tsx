import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { AuthResponse, LoginCredentials } from '../types';

/**
 * Props for the Login component
 */
interface LoginProps {
    onLogin: (userData: AuthResponse) => void;
}

/**
 * Login page component
 * Handles user authentication with email and password
 */
function Login({ onLogin }: LoginProps) {
    const [formData, setFormData] = useState<LoginCredentials>({
        email: '',
        password: '',
    });
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.login(formData);
            onLogin(response);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="flex justify-center">
                        <span className="text-4xl">🔔</span>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--foreground)]">
                        Sign in to Renewly
                    </h2>
                    <p className="mt-2 text-center text-sm text-[var(--muted-foreground)]">
                        Or{' '}
                        <Link
                            to="/register"
                            className="font-medium text-[var(--primary)] hover:brightness-90"
                        >
                            create a new account
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-[var(--destructive)] border border-[var(--destructive)] text-[var(--destructive-foreground)] px-4 py-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)]">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="input-field"
                                placeholder="your@email.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)]">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="input-field"
                                placeholder="Your password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-[var(--muted-foreground)]">
                            Demo credentials: test@example.com / password123
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
