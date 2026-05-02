import React from 'react';
import { FallbackProps } from 'react-error-boundary';
import { AxiosError } from 'axios';
import { AlertCircle, WifiOff, RefreshCcw } from 'lucide-react';

const GlobalErrorBoundary: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
    // Detect Axios network errors (like ERR_NETWORK or ERR_PROXY_CONNECTION_FAILED)
    const isNetworkError = 
        error instanceof AxiosError && 
        (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !error.response);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-[var(--card)] p-8 rounded-xl shadow-lg border border-[var(--border)] max-w-md w-full">
                <div className="flex justify-center mb-6">
                    {isNetworkError ? (
                        <div className="bg-[var(--destructive)]/10 p-4 rounded-full">
                            <WifiOff className="w-12 h-12 text-[var(--destructive)]" />
                        </div>
                    ) : (
                        <div className="bg-[var(--destructive)]/10 p-4 rounded-full">
                            <AlertCircle className="w-12 h-12 text-[var(--destructive)]" />
                        </div>
                    )}
                </div>
                
                <h1 className="text-2xl font-bold text-[var(--foreground)] mb-3">
                    {isNetworkError ? 'Connection Lost' : 'Something went wrong'}
                </h1>
                
                <p className="text-[var(--muted-foreground)] mb-8 leading-relaxed">
                    {isNetworkError 
                        ? 'We are unable to connect to the server. Please check your internet connection or try disabling your VPN/Proxy, and then try again.'
                        : (error instanceof Error ? error.message : 'An unexpected error occurred while loading this page.')}
                </p>

                <button 
                    onClick={resetErrorBoundary}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                >
                    <RefreshCcw className="w-5 h-5" />
                    Try Again
                </button>
            </div>
        </div>
    );
};

export default GlobalErrorBoundary;
