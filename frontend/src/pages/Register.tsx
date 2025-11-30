import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { AuthResponse, RegisterData } from '../types';

/**
 * Props for the Register component
 */
interface RegisterProps {
    onLogin: (userData: AuthResponse) => void;
}

/**
 * Form data for registration (includes confirmPassword for validation)
 */
interface RegisterFormData extends RegisterData {
    confirmPassword: string;
}

/**
 * Registration page component
 * Handles new user registration and auto-login
 */
function Register({ onLogin }: RegisterProps) {
    const [formData, setFormData] = useState<RegisterFormData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
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

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            await api.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });

            // Auto-login after registration
            const loginResponse = await api.login({
                email: formData.email,
                password: formData.password,
            });

            onLogin(loginResponse);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Registration failed');
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
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-[var(--muted-foreground)]">
                        Or{' '}
                        <Link
                            to="/login"
                            className="font-medium text-[var(--primary)] hover:brightness-90"
                        >
                            sign in to your existing account
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
                            <label htmlFor="name" className="block text-sm font-medium text-[var(--foreground)]">
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                className="input-field"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="input-field"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="input-field"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
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
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
