import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import Dashboard from './pages/Dashboard.tsx';
import AddSubscription from './pages/AddSubscription.tsx';
import Settings from './pages/Settings.tsx';
import Analytics from './pages/Analytics.tsx';
import Navbar from './components/Navbar.tsx';
import { DarkModeProvider } from './contexts/DarkModeContext.tsx';
import { api } from './services/api';
import type { AuthResponse } from './types';

/**
 * Main App Component
 * 
 * Manages authentication state and routing for the entire application.
 */
function App() {
    // User can be null (logged out) or contain auth data (logged in)
    const [user, setUser] = useState<AuthResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (token && refreshToken) {
            // EXPLANATION: When the app loads, we check if the user has tokens stored
            // If they do, we need to:
            // 1. Set the token in the API service so future requests include it
            // 2. Create a user object so the app knows they're logged in

            // Step 1: Configure the API service to use this token
            api.setAuthToken(token);

            // Step 2: Create a minimal AuthResponse object
            // We don't have the full user data yet, but we have the tokens
            // The API interceptor will automatically refresh if the token is expired
            setUser({
                accessToken: token,
                refreshToken: refreshToken,
                // Minimal user object - in a real app, you might want to fetch this from /api/me
                user: {
                    id: 0,
                    email: '',
                    name: 'User',
                    createdAt: '',
                    updatedAt: ''
                }
            });
        }
        setLoading(false);
    }, []);

    /**
     * Handle user login
     * Stores tokens in localStorage and updates state
     */
    const login = (userData: AuthResponse): void => {
        setUser(userData);
        localStorage.setItem('accessToken', userData.accessToken);
        localStorage.setItem('refreshToken', userData.refreshToken);
        api.setAuthToken(userData.accessToken);
    };

    /**
     * Handle user logout
     * Clears tokens from localStorage and resets state
     */
    const logout = async (): Promise<void> => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await api.post('/auth/logout', { refreshToken });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            api.setAuthToken(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[var(--primary)]"></div>
            </div>
        );
    }

    return (
        <DarkModeProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <div className="min-h-screen bg-[var(--background)]">
                    {user && <Navbar user={user} onLogout={logout} />}

                    <Routes>
                        <Route
                            path="/login"
                            element={!user ? <Login onLogin={login} /> : <Navigate to="/dashboard" />}
                        />
                        <Route
                            path="/register"
                            element={!user ? <Register onLogin={login} /> : <Navigate to="/dashboard" />}
                        />
                        <Route
                            path="/dashboard"
                            element={user ? <Dashboard /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/add-subscription"
                            element={user ? <AddSubscription /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/edit-subscription/:id"
                            element={user ? <AddSubscription /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/settings"
                            element={user ? <Settings /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/analytics"
                            element={user ? <Analytics /> : <Navigate to="/login" />}
                        />
                        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
                    </Routes>
                </div>
            </Router>
        </DarkModeProvider>
    );
}

export default App;
