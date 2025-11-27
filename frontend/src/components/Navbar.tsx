
import { Link, useLocation } from 'react-router-dom';
import type { AuthResponse } from '../types';

/**
 * Props for the Navbar component
 */
interface NavbarProps {
    user: AuthResponse;
    onLogout: () => void;
}

/**
 * Navigation bar component
 * Displays app logo, navigation links, user info, and logout button
 */
function Navbar({ user, onLogout }: NavbarProps) {
    const location = useLocation();

    const isActive = (path: string): boolean => location.pathname === path;

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/dashboard" className="flex items-center">
                            <span className="text-2xl font-bold text-primary-600">🔔</span>
                            <span className="ml-2 text-xl font-bold text-gray-900">Renewly</span>
                        </Link>

                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link
                                to="/dashboard"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard')
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/add-subscription"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/add-subscription')
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Add Subscription
                            </Link>
                            <Link
                                to="/settings"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/settings')
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Settings
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    {user?.user?.name?.[0]?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                                {user?.user?.name || 'User'}
                            </span>
                        </div>

                        <button
                            onClick={onLogout}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
