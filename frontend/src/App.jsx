import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddSubscription from './pages/AddSubscription';
import Navbar from './components/Navbar';
import { api } from './services/api';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            // Verify token and get user info
            setUser({ token });
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('accessToken', userData.accessToken);
        localStorage.setItem('refreshToken', userData.refreshToken);
        api.setAuthToken(userData.accessToken);
    };

    const logout = async () => {
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
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="min-h-screen bg-gray-50">
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
                    <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;