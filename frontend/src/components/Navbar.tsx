
import { Link, useLocation } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';
import { Bell, Sun, Moon, LogOut } from 'lucide-react';
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
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    const isActive = (path: string): boolean => location.pathname === path;

    return (
        <nav className="bg-[var(--card)] shadow-sm border-b border-[var(--border)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/dashboard" className="flex items-center gap-2">
                            <Bell className="h-6 w-6 text-[var(--primary)]" />
                            <span className="text-xl font-bold text-[var(--foreground)]">Renewly</span>
                        </Link>

                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link
                                to="/dashboard"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard')
                                    ? 'bg-[var(--muted)] text-[var(--primary)]'
                                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                                    }`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/add-subscription"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/add-subscription')
                                    ? 'bg-[var(--muted)] text-[var(--primary)]'
                                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                                    }`}
                            >
                                Add Subscription
                            </Link>
                            <Link
                                to="/analytics"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/analytics')
                                    ? 'bg-[var(--muted)] text-[var(--primary)]'
                                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                                    }`}
                            >
                                Analytics
                            </Link>
                            <Link
                                to="/settings"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/settings')
                                    ? 'bg-[var(--muted)] text-[var(--primary)]'
                                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                                    }`}
                            >
                                Settings
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-md hover:bg-[var(--muted)] transition-colors text-[var(--foreground)]"
                            aria-label="Toggle dark mode"
                        >
                            {isDarkMode ? (
                                <Sun className="h-5 w-5" />
                            ) : (
                                <Moon className="h-5 w-5" />
                            )}
                        </button>

                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center">
                                <span className="text-[var(--primary-foreground)] text-sm font-medium">
                                    {user?.user?.name?.[0]?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <span className="text-sm font-medium text-[var(--foreground)]">
                                {user?.user?.name || 'User'}
                            </span>
                        </div>

                        <button
                            onClick={onLogout}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
