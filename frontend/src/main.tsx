import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ErrorBoundary } from 'react-error-boundary'
import GlobalErrorBoundary from './components/GlobalErrorBoundary'
import App from './App.tsx'
import './global.css'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            throwOnError: true, // Throw to nearest Error Boundary
        },
        mutations: {
            throwOnError: true, // Throw mutation errors to boundary as well
        }
    },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <QueryErrorResetBoundary>
                {({ reset }) => (
                    <ErrorBoundary 
                        FallbackComponent={GlobalErrorBoundary}
                        onReset={reset}
                    >
                        <App />
                    </ErrorBoundary>
                )}
            </QueryErrorResetBoundary>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    </React.StrictMode>,
)
